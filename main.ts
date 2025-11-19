import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import {
	AlignmentEngineImpl,
	AlignmentServiceImpl,
	InMemoryAlignmentStore,
	AlignmentCustomizationControllerImpl,
	AlignmentOverlay,
	DEFAULT_ALIGNMENT_SETTINGS,
} from "./src/easyAlign";
import { detectDelimiter } from "./src/utils/detectDelimiter";
import type { AlignmentSettingsData } from "./src/easyAlign/types";

export default class EasyAlignPlugin extends Plugin {
	private readonly alignmentService = new AlignmentServiceImpl(new InMemoryAlignmentStore());
	private readonly engine = new AlignmentEngineImpl();

	async onload() {
		await this.alignmentService.load();

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

		const totalRules = this.alignmentService.getAllRules().length;
		console.log(`EasyAlignPlugin loaded with ${totalRules} rule(s)`);
	}

	onunload() {
		console.log("EasyAlignPlugin unloaded");
	}

	private alignWithOptions(editor: Editor, options: AlignmentSettingsData) {
		const selection = editor.getSelection();
		if (!selection) {
			new Notice("Please select text to align.");
			return;
		}

		const lines = selection.split("\n");
		const aligned = this.engine.alignLines(lines, options.delimiter, options.justify);
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
			const aligned = this.engine.alignLines(lines, options.delimiter, options.justify);
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
