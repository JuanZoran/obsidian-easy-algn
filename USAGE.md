# EasyAlign 插件使用指南

## 概述

EasyAlign 是一个 Obsidian 插件，用于对齐文本中的列。它支持多种对齐方式、过滤功能，以及针对特定分隔符（如等号）的智能处理。

## 基本使用

### 1. 通过命令使用

1. 选择要对齐的文本
2. 打开命令面板（`Ctrl/Cmd + P`）
3. 输入 "Align selection" 并执行
4. 文本将根据设置中的分隔符和对齐方式自动对齐

### 2. 配置设置

进入 **Settings → EasyAlign** 可以配置：

- **Alignment delimiter**：分隔符（如 `=`, `:`, `|` 等）
- **Justification**：对齐方式（Left/Center/Right）

## 高级功能

### 1. 每列独立对齐方式

**当前状态**：功能已实现，但需要通过编程方式使用。

**编程接口**：

```typescript
// 在插件代码中使用
const engine = new AlignmentEngineImpl();
const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];

// 为每列设置不同的对齐方式
const aligned = engine.alignLines(lines, '=', ['left', 'center', 'right']);
// 结果：
// - 第一列：左对齐
// - 第二列：居中对齐
// - 第三列：右对齐
// - 如果列数超过数组长度，会循环使用数组中的值
```

**使用场景**：
- 第一列左对齐，第二列右对齐：`['left', 'right']`
- 所有列居中对齐：`'center'` 或 `['center']`
- 混合对齐：`['left', 'right', 'center']` 会循环应用到所有列

**注意**：当前设置界面只支持单个对齐方式。要使用每列独立对齐，需要：
1. 通过插件 API 编程使用
2. 或等待未来版本添加 UI 支持

### 2. 过滤功能

**当前状态**：功能已实现，但需要通过编程方式使用。

**编程接口**：

```typescript
// 在插件代码中使用
const engine = new AlignmentEngineImpl();
const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];

// 只对齐第一列
const aligned = engine.alignLines(lines, '=', 'left', {
  filter: (data) => data.col === 0
});

// 排除第二行
const aligned2 = engine.alignLines(lines, '=', 'left', {
  filter: (data) => data.row !== 1
});

// 只对齐第一对列（n === 1）
const aligned3 = engine.alignLines(lines, '=', 'left', {
  filter: (data) => data.n === 1
});
```

**过滤函数参数说明**：

- `row`: 当前行号（从 0 开始）
- `ROW`: 总行数
- `col`: 当前列号（从 0 开始）
- `COL`: 当前行的总列数
- `s`: 当前单元格的字符串值（已修剪）
- `n`: 当前列对号（对于分隔符分割，n = Math.ceil((col + 1) / 2)）
- `N`: 当前行的总列对数

**常用过滤示例**：

```typescript
// 只对齐第一列
filter: (data) => data.col === 0

// 排除第一行
filter: (data) => data.row !== 0

// 只对齐前两列
filter: (data) => data.col < 2

// 只对齐最后等号后的内容（通常用于对齐赋值语句的值）
filter: (data) => data.n >= (data.N - 1)

// 排除空单元格
filter: (data) => data.s.length > 0
```

**注意**：当前没有 UI 界面来配置过滤功能。要使用过滤，需要：
1. 通过插件 API 编程使用
2. 或等待未来版本添加交互式界面

### 3. 等号特殊处理

**当前状态**：✅ **自动启用，无需配置**

当分隔符设置为 `=` 时，插件会自动应用特殊处理：

1. **自动规范化空白**：等号周围的多个空格会被规范化为单个空格
2. **智能分割**：支持复合操作符（`<=`, `>=`, `==`, `===`, `!=`, `+=`, `-=` 等）
3. **保持对齐**：对齐功能正常工作

**使用示例**：

输入：
```
a=b
aa<=bb
aaa===bbb
aaaa   =   cccc
```

对齐后（使用 `=` 作为分隔符）：
```
a    = b
aa   <= bb
aaa  === bbb
aaaa = cccc
```

**注意**：等号特殊处理是自动的，无需任何配置。只需在设置中将分隔符设置为 `=` 即可。

## 编程接口（API）

### AlignmentEngine 接口

```typescript
interface AlignmentEngine {
  alignLines(
    lines: string[],
    delimiter: string,
    justify: JustifyMode | JustifyMode[],
    options?: AlignmentOptions
  ): string[];
}
```

### 类型定义

```typescript
type JustifyMode = 'left' | 'center' | 'right';
type JustifyModeOrArray = JustifyMode | JustifyMode[];

interface AlignmentOptions {
  filter?: FilterPredicate;
}

type FilterPredicate = (data: {
  row: number;    // 当前行号（0-based）
  ROW: number;    // 总行数
  col: number;    // 当前列号（0-based）
  COL: number;    // 当前行的总列数
  s: string;      // 当前单元格内容（已修剪）
  n: number;      // 列对号
  N: number;      // 总列对数
}) => boolean;
```

## 完整使用示例

### 示例 1：基本对齐

```typescript
const engine = new AlignmentEngineImpl();
const lines = ['a=1', 'aa=22', 'ccc=333'];
const aligned = engine.alignLines(lines, '=', 'left');
// 结果：['a   = 1', 'aa  = 22', 'ccc = 333']
```

### 示例 2：每列独立对齐

```typescript
const engine = new AlignmentEngineImpl();
const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];
const aligned = engine.alignLines(lines, '=', ['left', 'center', 'right']);
// 第一列左对齐，第二列居中，第三列右对齐
```

### 示例 3：过滤对齐

```typescript
const engine = new AlignmentEngineImpl();
const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];
// 只对齐第一列
const aligned = engine.alignLines(lines, '=', 'left', {
  filter: (data) => data.col === 0
});
```

### 示例 4：等号特殊处理

```typescript
const engine = new AlignmentEngineImpl();
const lines = [
  'a=b',
  'aa<=bb',
  'aaa===bbb',
  'aaaa   =   cccc'
];
// 自动应用等号特殊处理
const aligned = engine.alignLines(lines, '=', 'left');
```

## 限制和注意事项

1. **UI 限制**：
   - 设置界面目前只支持单个对齐方式
   - 过滤功能没有 UI 界面
   - 需要通过编程方式使用高级功能

2. **等号特殊处理**：
   - 仅当分隔符精确为 `=` 时自动启用
   - 复合操作符（如 `<=`, `>=`）会被识别但输出时简化为 `=`

3. **中文支持**：
   - 插件自动检测中文字符并使用全角空格进行对齐
   - 确保中英文混合文本的对齐效果

## 未来计划

根据开发路线图，未来版本将添加：

1. **UI 支持每列独立对齐**：在设置界面中配置每列的对齐方式
2. **交互式过滤**：通过 UI 界面配置过滤条件
3. **实时预览**：在应用对齐前预览结果
4. **更多特殊分隔符**：逗号、竖线、空格等的特殊处理

## 反馈和贡献

如有问题或建议，请通过 GitHub Issues 反馈。

