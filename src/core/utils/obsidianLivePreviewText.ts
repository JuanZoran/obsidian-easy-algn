const PLACEHOLDER_PREFIX = '\u0000EA_CODE_';
const PLACEHOLDER_SUFFIX = '\u0000';

function createPlaceholder(index: number): string {
	return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
}

function protectInlineCodeSpans(input: string): { text: string; code: string[] } {
	const code: string[] = [];
	let text = '';

	for (let index = 0; index < input.length; index += 1) {
		const char = input[index];
		if (char !== '`') {
			text += char;
			continue;
		}

		// Count backticks to support variable-length code spans.
		let tickCount = 0;
		while (index + tickCount < input.length && input[index + tickCount] === '`') {
			tickCount += 1;
		}

		const delimiter = '`'.repeat(tickCount);
		const contentStart = index + tickCount;
		const contentEnd = input.indexOf(delimiter, contentStart);

		// No closing delimiter: treat as literal.
		if (contentEnd === -1) {
			text += delimiter;
			index += tickCount - 1;
			continue;
		}

		const content = input.slice(contentStart, contentEnd);
		const placeholder = createPlaceholder(code.length);
		code.push(content);
		text += placeholder;
		index = contentEnd + tickCount - 1;
	}

	return { text, code };
}

function restoreInlineCodeSpans(input: string, code: string[]): string {
	let text = input;
	for (let index = 0; index < code.length; index += 1) {
		const placeholder = createPlaceholder(index);
		text = text.split(placeholder).join(code[index] ?? '');
	}
	return text;
}

function splitOnce(input: string, delimiter: string): [string, string | undefined] {
	const index = input.indexOf(delimiter);
	if (index === -1) {
		return [input, undefined];
	}
	return [input.slice(0, index), input.slice(index + delimiter.length)];
}

function normalizeWikiLinkVisibleText(text: string): string {
	// Obsidian renders `[[folder/file.md]]` as `file` in many contexts.
	const lastSegment = text.includes('/') ? text.split('/').pop() ?? text : text;
	return lastSegment.endsWith('.md') ? lastSegment.slice(0, -3) : lastSegment;
}

/**
 * Convert raw Markdown (including Obsidian wiki links) into an approximation of what is
 * visible in Obsidian Live Preview. This is used only for width measurement.
 */
export function toObsidianLivePreviewText(input: string): string {
	if (!input) {
		return input;
	}

	// Protect inline code spans so we don't strip markup inside code.
	const { text: protectedText, code } = protectInlineCodeSpans(input);
	let text = protectedText;

	// Obsidian wiki links / embeds: ![[target|alias]] or [[target|alias]]
	text = text.replace(/!?\[\[([^\]]+?)\]\]/g, (_match, innerRaw: string) => {
		const inner = String(innerRaw ?? '');
		const [target, alias] = splitOnce(inner, '|');
		const visible = alias ?? target;
		return normalizeWikiLinkVisibleText(visible);
	});

	// Markdown links: [text](url) -> text
	text = text.replace(/\[([^\]]+?)\]\((?:[^)\\]|\\.)*?\)/g, '$1');

	// Basic emphasis/highlight markers that are hidden in Live Preview.
	// Apply longer markers first to avoid partially stripping nested ones.
	text = text.replace(/\*\*\*([^*]+?)\*\*\*/g, '$1');
	text = text.replace(/___([^_]+?)___/g, '$1');
	text = text.replace(/\*\*([^*]+?)\*\*/g, '$1');
	text = text.replace(/__([^_]+?)__/g, '$1');
	text = text.replace(/~~([^~]+?)~~/g, '$1');
	text = text.replace(/==([^=]+?)==/g, '$1');
	text = text.replace(/\*([^*\n]+?)\*/g, '$1');
	text = text.replace(/_([^_\n]+?)_/g, '$1');

	// Restore code spans (without backticks) after other stripping.
	return restoreInlineCodeSpans(text, code);
}
