import { Plugin } from 'obsidian';
import { AlignmentEngineImpl } from '../core/alignment/AlignmentEngineImpl';
import { SettingsService } from './services/SettingsService';
import { EditorService } from './services/EditorService';
import { AlignCommand } from './commands/AlignCommand';
import { InteractiveAlignCommand } from './commands/InteractiveAlignCommand';
import { SettingTab } from './ui/SettingTab';
import { DEFAULT_PLUGIN_SETTINGS } from '../settings';
import { DEFAULT_ALIGNMENT_SETTINGS } from '../easyAlign/defaults';

/**
 * Main plugin class for EasyAlign
 */
export default class EasyAlignPlugin extends Plugin {
	private settingsService!: SettingsService;
	private engine!: AlignmentEngineImpl;

	async onload() {
		// Initialize services
		this.settingsService = new SettingsService(this, DEFAULT_PLUGIN_SETTINGS);
		await this.settingsService.loadSettings();

		this.engine = new AlignmentEngineImpl();

		// Add setting tab
		this.addSettingTab(new SettingTab(this, this.settingsService));

		// Register commands
		this.addCommand({
			id: 'easy-align-selection',
			name: 'Align selection with defaults',
			editorCallback: (editor) => {
				const command = new AlignCommand(
					this.engine,
					this.settingsService,
					(e) => new EditorService(e),
					DEFAULT_ALIGNMENT_SETTINGS,
				);
				command.execute(editor);
			},
		});

		this.addCommand({
			id: 'easy-align-interactive',
			name: 'Align selection interactively',
			editorCallback: (editor) => {
				const command = new InteractiveAlignCommand(
					this.engine,
					this.settingsService,
					(e) => new EditorService(e),
				);
				command.execute(editor);
			},
		});
	}

	onunload() {
		// Plugin unloaded
	}
}
