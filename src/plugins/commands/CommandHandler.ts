import type { Editor } from 'obsidian';
import type { AlignmentEngine } from '../../core/alignment/AlignmentEngine';
import type { IEditorService } from '../services/EditorService';
import type { ISettingsService } from '../services/SettingsService';
import type { AlignmentSettingsData } from '../../easyAlign/types';

/**
 * Base interface for command handlers
 */
export interface ICommandHandler {
	/**
	 * Execute the command
	 */
	execute(editor: Editor): void | Promise<void>;
}
