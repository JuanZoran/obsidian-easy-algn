import { App, Editor, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import {
	AlignmentEngineImpl,
	AlignmentCustomizationControllerImpl,
	AlignmentOverlay,
	DEFAULT_ALIGNMENT_SETTINGS,
} from "./src/easyAlign";
import { detectDelimiter } from "./src/utils/detectDelimiter";
import type { AlignmentSettingsData } from "./src/easyAlign/types";
import { DEFAULT_PLUGIN_SETTINGS, type EasyAlignPluginSettings } from "./src/settings";

export default class EasyAlignPlugin extends Plugin {
	private readonly engine = new AlignmentEngineImpl();
	settings: EasyAlignPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new EasyAlignSettingTab(this.app, this));

		this.addCommand({
			id: "easy-align-selection",
			name: "Align selection with defaults",
			editorCallback: (editor: Editor) => this.alignWithOptions(editor, DEFAULT_ALIGNMENT_SETTINGS),
		});

		this.addCommand({
			id: "easy-align-interactive",
			name: "Align selection interactively",
			editorCallback: (editor: Editor) => this.promptInteractiveAlignment(editor),
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_PLUGIN_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		// Plugin unloaded
	}

	private alignWithOptions(editor: Editor, options: AlignmentSettingsData) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice("Please select text to align.");
			return;
		}

		const lines = selection.split("\n");
		const aligned = this.engine.alignLines(lines, options.delimiter, options.justify, {
			trimWhitespace: this.settings.trimWhitespace,
			addSpacesAroundDelimiter: this.settings.addSpacesAroundDelimiter,
			useFullwidthSpaces: this.settings.useFullwidthSpaces,
		});
		editor.replaceSelection(aligned.join("\n"));
	}

	private promptInteractiveAlignment(editor: Editor) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice("Please select text to align.");
			return;
		}

		const lines = selection.split("\n");
		const detectedDelimiter = detectDelimiter(lines);
		const initialSettings = {
			delimiter: detectedDelimiter ?? DEFAULT_ALIGNMENT_SETTINGS.delimiter,
			justify: DEFAULT_ALIGNMENT_SETTINGS.justify,
		};
		const controller = new AlignmentCustomizationControllerImpl(initialSettings);

		const selectionStart = editor.getCursor("from");
		const selectionEnd = editor.getCursor("to");
		const startOffset = editor.posToOffset(selectionStart);
		let currentEndOffset = editor.posToOffset(selectionEnd);
		const originalSelection = selection;

		const applyPreviewToEditor = (options: AlignmentSettingsData) => {
			const aligned = this.engine.alignLines(lines, options.delimiter, options.justify, {
				trimWhitespace: this.settings.trimWhitespace,
				addSpacesAroundDelimiter: this.settings.addSpacesAroundDelimiter,
				useFullwidthSpaces: this.settings.useFullwidthSpaces,
			});
			const fromPos = editor.offsetToPos(startOffset);
			const toPos = editor.offsetToPos(currentEndOffset);
			editor.replaceRange(aligned.join("\n"), fromPos, toPos);
			currentEndOffset = startOffset + aligned.join("\n").length;
			const updatedEndPos = editor.offsetToPos(currentEndOffset);
			editor.setSelection(fromPos, updatedEndPos);
		};

		const cancelPreview = () => {
			const fromPos = editor.offsetToPos(startOffset);
			const toPos = editor.offsetToPos(currentEndOffset);
			editor.replaceRange(originalSelection, fromPos, toPos);
			currentEndOffset = startOffset + originalSelection.length;
			const restoredEndPos = editor.offsetToPos(currentEndOffset);
			editor.setSelection(fromPos, restoredEndPos);
		};

		const overlay = new AlignmentOverlay(
			lines,
			controller,
			applyPreviewToEditor,
			() => {
				new Notice("Interactive alignment applied.");
			},
			cancelPreview,
		);

		overlay.open();
	}
}

class EasyAlignSettingTab extends PluginSettingTab {
	plugin: EasyAlignPlugin;

	constructor(app: App, plugin: EasyAlignPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("去除首尾空格")
			.setDesc("在对齐过程中自动去除单元格的首尾空格")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.trimWhitespace);
				toggle.onChange(async (value) => {
					this.plugin.settings.trimWhitespace = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("分隔符前后添加空格")
			.setDesc("在对齐时自动在分隔符前后添加空格（如 : 变成 : ）")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.addSpacesAroundDelimiter);
				toggle.onChange(async (value) => {
					this.plugin.settings.addSpacesAroundDelimiter = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("使用全角空格对齐")
			.setDesc("在补齐空白和分隔符两侧时使用全角空格（适合中日韩排版）")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.useFullwidthSpaces);
				toggle.onChange(async (value) => {
					this.plugin.settings.useFullwidthSpaces = value;
					await this.plugin.saveSettings();
				});
			});
	}
}
