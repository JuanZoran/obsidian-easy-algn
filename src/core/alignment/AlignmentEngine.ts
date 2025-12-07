import type { AlignmentOptions, JustifyModeOrArray } from '../../easyAlign/types';

/**
 * Core alignment engine interface
 */
export interface AlignmentEngine {
	/**
	 * Align lines of text using the given delimiter and justification
	 */
	alignLines(
		lines: string[],
		delimiter: string,
		justify: JustifyModeOrArray,
		options?: AlignmentOptions,
	): string[];
}
