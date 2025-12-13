import { displayWidth, isFullwidthCodePoint } from '../../utils/displayWidth';
import { toObsidianLivePreviewText } from './obsidianLivePreviewText';

export interface DisplayWidthOptions {
	ignoreMarkdownSyntax?: boolean;
}

/**
 * Calculate the display width of text
 */
export function calculateDisplayWidth(text: string, options?: DisplayWidthOptions): number {
	if (options?.ignoreMarkdownSyntax) {
		return displayWidth(toObsidianLivePreviewText(text));
	}
	return displayWidth(text);
}

/**
 * Check if a string contains fullwidth characters
 */
export function hasFullwidthCharacters(text: string): boolean {
	for (let index = 0; index < text.length; index += 1) {
		const codePoint = text.codePointAt(index);
		if (codePoint === undefined) {
			continue;
		}

		if (codePoint > 0xffff) {
			index += 1;
		}

		if (isFullwidthCodePoint(codePoint)) {
			return true;
		}
	}
	return false;
}

/**
 * Create padding string with specified display width
 */
export function createPadding(displayUnits: number, useFullwidth: boolean): string {
	if (displayUnits <= 0) {
		return '';
	}

	if (!useFullwidth) {
		return ' '.repeat(displayUnits);
	}

	const fullwidthCount = Math.floor(displayUnits / 2);
	const needsHalfWidth = displayUnits % 2 !== 0;
	return '　'.repeat(fullwidthCount) + (needsHalfWidth ? ' ' : '');
}
