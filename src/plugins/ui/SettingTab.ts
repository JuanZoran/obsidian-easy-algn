import { PluginSettingTab, Setting } from 'obsidian';
import type { Plugin } from 'obsidian';
import type { ISettingsService } from '../services/SettingsService';
import type { EasyAlignPluginSettings } from '../../settings';

/**
 * Settings tab for the plugin
 */
export class SettingTab extends PluginSettingTab {
	constructor(
		plugin: Plugin,
		private readonly settingsService: ISettingsService,
	) {
		super(plugin.app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('去除首尾空格')
			.setDesc('在对齐过程中自动去除单元格的首尾空格')
			.addToggle((toggle) => {
				const settings = this.settingsService.getSettings();
				toggle.setValue(settings.trimWhitespace);
				toggle.onChange(async (value) => {
					await this.settingsService.updateSettings({ trimWhitespace: value });
				});
			});

		new Setting(containerEl)
			.setName('分隔符前后添加空格')
			.setDesc('在对齐时自动在分隔符前后添加空格（如 : 变成 : ）')
			.addToggle((toggle) => {
				const settings = this.settingsService.getSettings();
				toggle.setValue(settings.addSpacesAroundDelimiter);
				toggle.onChange(async (value) => {
					await this.settingsService.updateSettings({ addSpacesAroundDelimiter: value });
				});
			});

		new Setting(containerEl)
			.setName('使用全角空格对齐')
			.setDesc('在补齐空白和分隔符两侧时使用全角空格（适合中日韩排版）')
			.addToggle((toggle) => {
				const settings = this.settingsService.getSettings();
				toggle.setValue(settings.useFullwidthSpaces);
				toggle.onChange(async (value) => {
					await this.settingsService.updateSettings({ useFullwidthSpaces: value });
				});
			});
	}
}
