# API 接口暴露情况分析

## 当前状态总结

### ✅ 已暴露给用户的功能

1. **基本对齐功能**
   - ✅ 通过命令 "Align selection" 使用
   - ✅ 通过设置界面配置分隔符和对齐方式
   - ✅ 等号特殊处理自动启用（当分隔符为 `=` 时）

### ⚠️ 部分暴露的功能

2. **每列独立对齐方式**
   - ✅ 接口已定义（`JustifyModeOrArray`）
   - ✅ 引擎支持数组格式
   - ❌ **设置界面不支持**（只能选择单个对齐方式）
   - ❌ **命令不支持**（使用设置中的单个值）
   - ✅ 可通过编程 API 使用

3. **过滤功能**
   - ✅ 接口已定义（`AlignmentOptions`）
   - ✅ 引擎完全支持
   - ❌ **没有 UI 界面**
   - ❌ **命令不支持**
   - ✅ 可通过编程 API 使用

## 用户使用方式

### 方式 1：通过 Obsidian 命令（当前可用）

**步骤**：
1. 选择要对齐的文本
2. 按 `Ctrl/Cmd + P` 打开命令面板
3. 输入 "Align selection" 并执行

**限制**：
- 只能使用设置中配置的单个对齐方式
- 不能使用过滤功能
- 等号特殊处理自动应用（如果分隔符是 `=`）

### 方式 2：通过设置界面（当前可用）

**步骤**：
1. 打开 **Settings → EasyAlign**
2. 配置 **Alignment delimiter**（如 `=`, `:`, `|`）
3. 选择 **Justification**（Left/Center/Right）

**限制**：
- 只能选择单个对齐方式
- 不能配置每列独立对齐
- 不能配置过滤条件

### 方式 3：通过编程 API（高级用户）

**适用场景**：
- 开发其他插件
- 编写自定义脚本
- 需要高级功能（每列独立对齐、过滤）

**示例代码**：

```typescript
import { AlignmentEngineImpl } from './src/easyAlign/engine';

// 创建引擎实例
const engine = new AlignmentEngineImpl();

// 基本使用
const lines = ['a=1', 'aa=22', 'ccc=333'];
const aligned = engine.alignLines(lines, '=', 'left');

// 每列独立对齐
const aligned2 = engine.alignLines(lines, '=', ['left', 'right', 'center']);

// 使用过滤
const aligned3 = engine.alignLines(lines, '=', 'left', {
  filter: (data) => data.col === 0  // 只对齐第一列
});
```

## 问题分析

### 问题 1：每列独立对齐方式未完全暴露

**当前实现**：
- `main.ts` 第 52 行：`this.engine.alignLines(lines, this.settings.delimiter, this.settings.justify)`
- `this.settings.justify` 可能是数组，但设置界面只允许选择单个值

**影响**：
- 用户无法通过 UI 配置每列独立对齐
- 如果通过编程方式设置数组，命令可以使用，但无法通过 UI 配置

### 问题 2：过滤功能未暴露

**当前实现**：
- `main.ts` 第 52 行：没有传递 `options` 参数
- 过滤功能完全无法通过命令使用

**影响**：
- 用户无法使用过滤功能
- 只能通过编程 API 使用

## 建议的改进方案

### 方案 1：增强设置界面（推荐）

**为每列独立对齐添加 UI**：

```typescript
// 在 settings.ts 中添加
new Setting(containerEl)
  .setName('Per-column justification')
  .setDesc('Enable different justification for each column')
  .addToggle((toggle) => {
    toggle.setValue(Array.isArray(this.settings.justify));
    toggle.onChange((value) => {
      if (value) {
        // 切换到数组模式
        this.settings.updateJustify(['left', 'left']);
      } else {
        // 切换到单个模式
        const current = this.settings.justify;
        this.settings.updateJustify(Array.isArray(current) ? current[0] : current);
      }
    });
  });

// 如果启用，显示每列配置界面
if (Array.isArray(this.settings.justify)) {
  // 添加每列的对齐方式选择器
}
```

### 方案 2：添加新命令

**添加带选项的命令**：

```typescript
// 在 main.ts 中添加
this.addCommand({
  id: "easy-align-selection-filtered",
  name: "Align selection (first column only)",
  editorCallback: (editor: Editor) => {
    this.alignSelectionWithFilter(editor, (data) => data.col === 0);
  },
});

private alignSelectionWithFilter(
  editor: Editor, 
  filter: FilterPredicate
) {
  const selection = editor.getSelection();
  if (!selection) {
    new Notice("Please select text to align.");
    return;
  }
  const lines = selection.split("\n");
  const aligned = this.engine.alignLines(
    lines, 
    this.settings.delimiter, 
    this.settings.justify,
    { filter }
  );
  editor.replaceSelection(aligned.join("\n"));
}
```

### 方案 3：添加交互式模态框（最佳体验）

**创建对齐配置模态框**：

```typescript
// 创建 src/ui/alignmentModal.ts
export class AlignmentModal extends Modal {
  // 允许用户：
  // 1. 选择每列的对齐方式
  // 2. 配置过滤条件
  // 3. 预览结果
}
```

## 当前用户可用的功能总结

### ✅ 完全可用

1. **基本对齐**：通过命令和设置界面
2. **等号特殊处理**：自动启用，无需配置

### ⚠️ 部分可用（需编程）

3. **每列独立对齐**：可通过编程 API 使用，但无法通过 UI 配置
4. **过滤功能**：只能通过编程 API 使用

## 使用建议

### 对于普通用户

**当前可以**：
- 使用命令对齐文本
- 配置基本的分隔符和对齐方式
- 享受等号特殊处理（自动）

**无法使用**：
- 每列独立对齐（需要编程）
- 过滤功能（需要编程）

### 对于开发者

**可以**：
- 使用完整的编程 API
- 集成到其他插件中
- 创建自定义对齐逻辑

**示例**：

```typescript
// 在其他插件中使用
import { AlignmentEngineImpl } from 'easy-align-plugin';

const engine = new AlignmentEngineImpl();
const result = engine.alignLines(
  lines,
  '=',
  ['left', 'right'],
  {
    filter: (data) => data.col < 2  // 只对齐前两列
  }
);
```

## 结论

**当前状态**：
- ✅ 核心功能已暴露（基本对齐、等号特殊处理）
- ⚠️ 高级功能已实现但未完全暴露（每列独立对齐、过滤）
- 📝 已创建使用文档（USAGE.md）

**下一步**：
1. 增强设置界面以支持每列独立对齐
2. 添加过滤功能的 UI 或命令
3. 或创建交互式模态框提供完整功能访问



