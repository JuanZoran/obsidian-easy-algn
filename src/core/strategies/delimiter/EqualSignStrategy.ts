import type { DelimiterStrategy, GlueOptions } from './DelimiterStrategy';

/**
 * Strategy for handling equal sign delimiters with special pattern matching
 * Handles =, <=, >=, ==, ===, etc.
 */
export class EqualSignStrategy implements DelimiterStrategy {
	canHandle(delimiter: string): boolean {
		return delimiter === '=';
	}

	split(line: string): string[] {
		// Preprocess line first
		const preprocessed = this.preprocessLine(line);
		
		// Split by equal sign patterns
		const equalPattern = /([<>!+\-*/%&|^]?=+[<>~]?)/g;
		const parts: string[] = [];
		let lastIndex = 0;

		for (const match of preprocessed.matchAll(equalPattern)) {
			if (match.index === undefined) continue;
			
			// Add part before match
			if (match.index > lastIndex) {
				parts.push(preprocessed.substring(lastIndex, match.index).trim());
			}
			lastIndex = match.index + match[0].length;
		}

		// Add remaining part
		if (lastIndex < preprocessed.length) {
			parts.push(preprocessed.substring(lastIndex).trim());
		}

		return parts.length > 0 ? parts : [preprocessed.trim()];
	}

	createGlue(options: GlueOptions): string {
		const { addSpaces = true, useFullwidthSpaces = false } = options;

		if (!addSpaces) {
			return '=';
		}

		const space = useFullwidthSpaces ? '　' : ' ';
		return `${space}=${space}`;
	}

	/**
	 * Preprocess line to normalize whitespace around equal signs
	 */
	private preprocessLine(line: string): string {
		// Normalize whitespace around equal sign patterns (=, <=, >=, ==, etc.)
		// Replace whitespace around equal sign patterns with single space, then collapse multiple spaces
		const equalPattern = /\s*([<>!+\-*/%&|^]?=+[<>~]?)\s*/g;
		return line.replace(equalPattern, ' $1 ').replace(/\s{2,}/g, ' ').trim();
	}
}
