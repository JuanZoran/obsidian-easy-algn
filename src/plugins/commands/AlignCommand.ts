import type { Editor } from 'obsidian';
import { Notice } from 'obsidian';
import type { ICommandHandler } from './CommandHandler';
import type { AlignmentEngine } from '../../core/alignment/AlignmentEngine';
import type { IEditorService } from '../services/EditorService';
import type { ISettingsService } from '../services/SettingsService';
import type { AlignmentSettingsData } from '../../easyAlign/types';

/**
 * Command handler for simple alignment with default settings
 */
export class AlignCommand implements ICommandHandler {
	constructor(
		private readonly engine: AlignmentEngine,
		private readonly settingsService: ISettingsService,
		private readonly editorServiceFactory: (editor: Editor) => IEditorService,
		private readonly defaultSettings: AlignmentSettingsData,
	) {}

	execute(editor: Editor): void {
		const editorService = this.editorServiceFactory(editor);
		const selection = editorService.getSelection();

		if (!selection) {
			new Notice('Please select text to align.');
			return;
		}

		const lines = selection.split('\n');
		const settings = this.settingsService.getSettings();
		const aligned = this.engine.alignLines(
			lines,
			this.defaultSettings.delimiter,
			this.defaultSettings.justify,
			{
				trimWhitespace: settings.trimWhitespace,
				addSpacesAroundDelimiter: settings.addSpacesAroundDelimiter,
				useFullwidthSpaces: settings.useFullwidthSpaces,
			},
		);

		editorService.replaceSelection(aligned.join('\n'));
	}
}
