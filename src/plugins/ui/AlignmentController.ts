import type { AlignmentSettingsData, JustifyModeOrArray } from '../../easyAlign/types';
import { DEFAULT_ALIGNMENT_SETTINGS } from '../../easyAlign/defaults';

/**
 * Controller for alignment settings in UI
 */
export class AlignmentController {
	private delimiter: string;
	private justify: JustifyModeOrArray;

	constructor(initial?: AlignmentSettingsData) {
		this.delimiter = initial?.delimiter ?? DEFAULT_ALIGNMENT_SETTINGS.delimiter;
		this.justify = initial?.justify ?? DEFAULT_ALIGNMENT_SETTINGS.justify;
	}

	setDelimiter(value: string): void {
		this.delimiter = value;
	}

	setJustify(value: JustifyModeOrArray): void {
		this.justify = value;
	}

	getCurrentState(): AlignmentSettingsData {
		return {
			delimiter: this.delimiter,
			justify: this.justify,
		};
	}

	async submit(): Promise<AlignmentSettingsData> {
		const sanitized = this.delimiter?.trim();
		const finalDelimiter =
			sanitized && sanitized.length > 0 ? sanitized : DEFAULT_ALIGNMENT_SETTINGS.delimiter;
		const finalJustify = this.justify ?? DEFAULT_ALIGNMENT_SETTINGS.justify;

		this.delimiter = finalDelimiter;
		this.justify = finalJustify;

		return {
			delimiter: finalDelimiter,
			justify: finalJustify,
		};
	}
}
