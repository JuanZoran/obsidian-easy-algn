# EasyAlign 插件路线与 TDD TODO

本文件聚焦 Obsidian 插件的发展路线，剔除 Vim 特有的命令流，把重点放在 GUI/命令交互、可测性和可扩展性上，并在每个里程碑中强调“先写测试，再实现，再确认”的 TDD 过程。

## 0. 已实现（可确认）
- ✅ 支持中文/全角宽度的对齐引擎，并通过 Jest 覆盖主要对齐逻辑（`alignmentEngine.test.ts`）。
- ✅ 交互式 modal（类 IDE 重命名输入框）用于在命令执行时收集 delimiter/justify，避免在设置中存储冗余状态。
- ✅ 命令 `easy-align-selection` 与 `easy-align-interactive` 已注册，命令回调与交互 controller 以及 modal 通过测试（`alignmentCustomization.test.ts`）保持红灯—绿灯流程。

## 1. 交互式体验提升（优先级：高）

### 1.1 实时 inline preview
- [x] 把 overlay 的“预览区域”移除，改为在选中文本区域实时替换对齐结果（只保留一个简洁的输入面板），在输入变化时立即调用 `applyPreviewToEditor` 将对齐结果写回原位置，按 Enter 即可确认，Esc/Cancel 恢复原始文本。
- [x] 使用 `posToOffset`/`offsetToPos` 固定起始 offset，避免每次 preview 都复制块，确保每次输入只在原区域内回写。
- [x] 更新相关测试（`alignmentOverlay.test.ts`）以断言聚焦、Enter、Esc 路径。
- [ ] 在 overlay 中记录最后一次预览状态，用于 `Enter` 确认前如果用户未做改动可以避免重写。
- [x] 自动检测常见分隔符（`:`, `=`, `,`, `|`, `：`, `;`）并把结果作为 initial delimiter，保证打开 overlay 时已经有合理默认值。
- [ ] Live Preview 渲染增强：对包含对齐符号的行在预览中应用 monospace + `white-space: pre` 样式，确保渲染端与源码一样对齐。

### 1.2 键盘交互与命令反馈
- [x] 聚焦 delimiter 输入框后，按 `Enter` 等价于点击 Apply，`Esc` 等价于 Cancel，并通过模拟键盘事件的 Jest 测试确保不会回归。
- [ ] 检查 `Notice`/状态提示是否仍有必要，如果要恢复需要模拟 controller 回调并断言提示内容。

## 2. 过滤与步骤系统（优先级：中高）

### 2.1 基于条件的过滤
- [ ] 完善 filter API，让命令可传入 `row`、`col`、`n`、`N` 条件函数以决定是否算入对齐；modal 可提供简单表达式（如 `row !== 1`）模板。
  - **TDD**：多写 `alignmentEngine` 中过滤逻辑的测试用例，包括 `n`/`row` 等字段；为 modal 的表达式解析写单位测试。

### 2.2 可组合的前置步骤
- [ ] 提供 `preSplit`、`preJustify`、`preMerge` hook，默认行为可无缝与现有 engine 结合，例如自动 `trim`、`pairing`。
  - **TDD**：先实现`StepRunner`类及其 hook 流程并测试，然后将其注入命令/engine 中。

## 3. 分隔符与合并策略（优先级：中）

### 3.1 多种 delimiter 支持
- [ ] 支持分隔符数组，并在 engine 中循环使用（配合 modal 中的模式列表），让一个命令处理 `=`, `:`, `|` 等。
  - **TDD**：为 `resolveDelimiterForColumn(index)` 写单测，确保循环逻辑在 `rows.map` 下仍然正常。
- [ ] 加强对 `=`、`,`, `|` 等符号的特殊处理（trim、space glue），在 engine 中封装为可替换策略。

### 3.2 空格/缩进策略
- [ ] 提供空格压缩/缩进保留选项（例如只 trim 末尾、保持开头缩进、保留最小间距）。
  - **TDD**：用示例字符串验证 `createPadding` 与 `padCell` 在各种策略下的行为。

## 4. 用户体验与文档（优先级：中）

- [ ] 把最新交互（按键联动、inline preview）写进 README/USAGE，特别强调命令窗口内的 Enter/Cancel 行为和 inline 编辑就是实时预览。
- [ ] 在 TODO 或 release note 记录“原选区就地替换”的行为变化，以便 QA/用户理解无需额外预览。
- [ ] 为 modal/命令添加键盘操作单测（使用 jest mock 事件），再覆盖 `Enter`/`Esc` 分支，避免未来重构回退到旧模式。

## 5. API/脚本扩展（优先级：中低）

- [ ] 暴露 `alignStrings(lines, options)` 函数供外部调用（如其他插件或宏），依旧保持在 `AlignmentEngineImpl` 之上。
- [ ] 提供 `Parts` 结构（类似 mini.align），并为其 `apply/group/pair/trim` 提供链式 API，客户端测试可用 fixtures 验证。

## 6. TDD 路线建议

1. **每个新特性先写测试**：从 controller、preview helpers、过滤 hook 到命令流程，始终先写 jest 断言，确保边界清晰。  
2. **用模拟对象替代 Obsidian**：命令与 modal 可以通过 jest stub `Editor`/`Notice`，方便断言 `alignLines` 是否被调用。  
3. **持续整合**：每个阶段都跑 `npm test`，确保新增测试覆盖清晰，避免回归。  
4. **记录交付状态**：每完成一个子任务就更新此 TODO，勾选 `[x]` 并写明验证命令/测试，保持团队可见性。
