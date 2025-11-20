import type { AlignmentSettingsData, JustifyModeOrArray } from './types';
import { DEFAULT_ALIGNMENT_SETTINGS } from './defaults';

export type AlignmentCustomizationSaveHook = (data: AlignmentSettingsData) => Promise<void> | void;

export interface AlignmentCustomizationController {
	setDelimiter(value: string): void;
	setJustify(value: JustifyModeOrArray): void;
	getCurrentState(): AlignmentSettingsData;
	submit(): Promise<AlignmentSettingsData>;
}

export class AlignmentCustomizationControllerImpl implements AlignmentCustomizationController {
	private delimiter: string;
	private justify: JustifyModeOrArray;

	constructor(initial?: AlignmentSettingsData, private readonly onSave?: AlignmentCustomizationSaveHook) {
		this.delimiter = initial?.delimiter ?? DEFAULT_ALIGNMENT_SETTINGS.delimiter;
		this.justify = initial?.justify ?? DEFAULT_ALIGNMENT_SETTINGS.justify;
	}

	setDelimiter(value: string): void {
		this.delimiter = value;
	}

	setJustify(value: JustifyModeOrArray): void {
		this.justify = value;
	}

	async submit(): Promise<AlignmentSettingsData> {
		const sanitized = this.delimiter?.trim();
		const finalDelimiter =
			sanitized && sanitized.length > 0 ? sanitized : DEFAULT_ALIGNMENT_SETTINGS.delimiter;
		const finalJustify = this.justify ?? DEFAULT_ALIGNMENT_SETTINGS.justify;

		this.delimiter = finalDelimiter;
		this.justify = finalJustify;

		const payload: AlignmentSettingsData = {
			delimiter: finalDelimiter,
			justify: finalJustify,
		};

		if (this.onSave) {
			await this.onSave(payload);
		}

		return payload;
	}

	getCurrentState(): AlignmentSettingsData {
		return {
			delimiter: this.delimiter,
			justify: this.justify,
		};
	}
}
