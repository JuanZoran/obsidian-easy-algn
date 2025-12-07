import type { DelimiterDetectionOptions } from '../utils/detectDelimiter';
import { detectDelimiter as detectDelimiterUtil } from '../utils/detectDelimiter';

/**
 * Service for detecting delimiters in text
 */
export class DelimiterDetector {
	/**
	 * Detect the most likely delimiter from a set of lines
	 */
	detect(lines: string[], options?: DelimiterDetectionOptions): string | undefined {
		return detectDelimiterUtil(lines, options);
	}

	/**
	 * Detect delimiter with a default fallback
	 */
	detectWithFallback(lines: string[], fallback: string = '=', options?: DelimiterDetectionOptions): string {
		return this.detect(lines, options) ?? fallback;
	}
}
