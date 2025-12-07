import type { DelimiterStrategy, GlueOptions } from './DelimiterStrategy';
import { displayWidth } from '../../../utils/displayWidth';

/**
 * Strategy for handling simple string delimiters (colon, pipe, etc.)
 */
export class SimpleDelimiterStrategy implements DelimiterStrategy {
	canHandle(delimiter: string): boolean {
		// Don't handle empty delimiter or equal sign (handled by EqualSignStrategy)
		return delimiter.length > 0 && delimiter !== '=';
	}

	split(line: string): string[] {
		// Simple split - for most delimiters this works fine
		return line.split(this.getDelimiterFromContext() || '');
	}

	createGlue(options: GlueOptions): string {
		const { delimiter, addSpaces = true, useFullwidthSpaces = false } = options;

		if (!delimiter.length) {
			return delimiter;
		}

		const codePoints = [...delimiter];
		const isSingleCodePoint = codePoints.length === 1;
		const isWideDelimiter = isSingleCodePoint && displayWidth(delimiter) > 1;

		// For wide delimiters (like Chinese colon), don't add spaces
		if (isWideDelimiter) {
			return delimiter;
		}

		// For regular delimiters, add spaces if addSpaces is true
		if (!addSpaces) {
			return delimiter;
		}

		const space = useFullwidthSpaces ? '　' : ' ';
		return `${space}${delimiter}${space}`;
	}

	private currentDelimiter: string = '';

	/**
	 * Set the delimiter for splitting
	 */
	setDelimiter(delimiter: string): void {
		this.currentDelimiter = delimiter;
	}

	/**
	 * Get the current delimiter
	 */
	private getDelimiterFromContext(): string {
		return this.currentDelimiter;
	}

	/**
	 * Create a strategy instance for a specific delimiter
	 */
	static forDelimiter(delimiter: string): SimpleDelimiterStrategy {
		const strategy = new SimpleDelimiterStrategy();
		strategy.setDelimiter(delimiter);
		return strategy;
	}
}
