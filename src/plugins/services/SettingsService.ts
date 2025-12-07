import type { Plugin } from 'obsidian';
import type { EasyAlignPluginSettings } from '../../settings';

/**
 * Service for managing plugin settings
 */
export interface ISettingsService {
	/**
	 * Get current settings
	 */
	getSettings(): EasyAlignPluginSettings;

	/**
	 * Save settings
	 */
	saveSettings(): Promise<void>;

	/**
	 * Update settings
	 */
	updateSettings(updates: Partial<EasyAlignPluginSettings>): Promise<void>;
}

/**
 * Implementation of settings service
 */
export class SettingsService implements ISettingsService {
	private settings: EasyAlignPluginSettings;

	constructor(
		private readonly plugin: Plugin,
		private readonly defaultSettings: EasyAlignPluginSettings,
	) {
		// Settings will be loaded by the plugin
		this.settings = { ...defaultSettings };
	}

	/**
	 * Load settings from plugin storage
	 */
	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			this.defaultSettings,
			await this.plugin.loadData(),
		);
	}

	getSettings(): EasyAlignPluginSettings {
		return { ...this.settings };
	}

	async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.settings);
	}

	async updateSettings(updates: Partial<EasyAlignPluginSettings>): Promise<void> {
		this.settings = { ...this.settings, ...updates };
		await this.saveSettings();
	}
}
