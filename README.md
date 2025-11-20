# Easy Align

Easy Align keeps table-like text tidy inside Obsidian by detecting delimiters (`,`, `:`, `=`, `|` 等) and padding cells so columns line up both in the editor and after rendering.

## Features
- Real-time inline preview: edits are applied inside the active selection while the overlay is open, so you always see the latest alignment.
- Intelligent delimiter detection: the modal guesses the most consistent delimiter in the selected lines and pre-fills the input.
- Per-column justify support via `left` / `center` / `right`, with optional filtering hooks for advanced scenarios.
- Settings and overlay logic remain fully unit-tested (`alignmentEngine`, `alignmentOverlay`, etc).

## Commands
- **Align selection with defaults** (`easy-align-selection`): aligns the current selection using default delimiter / justify.
- **Align selection interactively** (`easy-align-interactive`): opens the overlay so you can adjust the delimiter, justify, and preview the effect inline.

## Development
- `npm install`
- `npm run dev` (watch + rebuild)
- `npm run build` (type-check + bundle)
- `npm test` (Jest, headless)

## Installing
Copy `main.js`, `manifest.json`, and `styles.css` to `<Vault>/.obsidian/plugins/easy-align/`, then reload Obsidian and enable the plugin.

## Testing guidance
- Unit tests live under `__tests__` and target the engine, overlay controller, preview helpers, etc.
- The overlay tests now focus on inline preview callbacks and keyboard behaviors (Enter applies, Esc cancels).

