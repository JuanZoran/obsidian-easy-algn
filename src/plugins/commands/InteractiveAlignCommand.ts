import type { Editor } from 'obsidian';
import { Notice } from 'obsidian';
import type { ICommandHandler } from './CommandHandler';
import type { AlignmentEngine } from '../../core/alignment/AlignmentEngine';
import type { IEditorService } from '../services/EditorService';
import type { ISettingsService } from '../services/SettingsService';
import { DelimiterDetector } from '../../detection/DelimiterDetector';
import type { AlignmentSettingsData } from '../../easyAlign/types';
import { DEFAULT_ALIGNMENT_SETTINGS } from '../../easyAlign/defaults';
import { AlignmentOverlay } from '../ui/AlignmentOverlay';
import { AlignmentController } from '../ui/AlignmentController';

/**
 * Command handler for interactive alignment with UI
 */
export class InteractiveAlignCommand implements ICommandHandler {
	private readonly detector: DelimiterDetector;

	constructor(
		private readonly engine: AlignmentEngine,
		private readonly settingsService: ISettingsService,
		private readonly editorServiceFactory: (editor: Editor) => IEditorService,
	) {
		this.detector = new DelimiterDetector();
	}

	execute(editor: Editor): void {
		const editorService = this.editorServiceFactory(editor);
		const selection = editorService.getSelection();

		if (!selection) {
			new Notice('Please select text to align.');
			return;
		}

		const lines = selection.split('\n');
		const detectedDelimiter = this.detector.detectWithFallback(
			lines,
			DEFAULT_ALIGNMENT_SETTINGS.delimiter,
		);

		const initialSettings: AlignmentSettingsData = {
			delimiter: detectedDelimiter,
			justify: DEFAULT_ALIGNMENT_SETTINGS.justify,
		};

		const controller = new AlignmentController(initialSettings);

		const selectionStart = editorService.getCursor('from');
		const selectionEnd = editorService.getCursor('to');
		const startOffset = editorService.posToOffset(selectionStart);
		let currentEndOffset = editorService.posToOffset(selectionEnd);
		const originalSelection = selection;
		const settings = this.settingsService.getSettings();

		const applyPreviewToEditor = (options: AlignmentSettingsData) => {
			const aligned = this.engine.alignLines(lines, options.delimiter, options.justify, {
				trimWhitespace: settings.trimWhitespace,
				addSpacesAroundDelimiter: settings.addSpacesAroundDelimiter,
				useFullwidthSpaces: settings.useFullwidthSpaces,
			});
			const fromPos = editorService.offsetToPos(startOffset);
			const toPos = editorService.offsetToPos(currentEndOffset);
			editorService.replaceRange(aligned.join('\n'), fromPos, toPos);
			currentEndOffset = startOffset + aligned.join('\n').length;
			const updatedEndPos = editorService.offsetToPos(currentEndOffset);
			editorService.setSelection(fromPos, updatedEndPos);
		};

		const cancelPreview = () => {
			const fromPos = editorService.offsetToPos(startOffset);
			const toPos = editorService.offsetToPos(currentEndOffset);
			editorService.replaceRange(originalSelection, fromPos, toPos);
			currentEndOffset = startOffset + originalSelection.length;
			const restoredEndPos = editorService.offsetToPos(currentEndOffset);
			editorService.setSelection(fromPos, restoredEndPos);
		};

		const overlay = new AlignmentOverlay(
			lines,
			controller,
			applyPreviewToEditor,
			() => {
				new Notice('Interactive alignment applied.');
			},
			cancelPreview,
		);

		overlay.open();
	}
}
