import type { AlignmentEngine, AlignmentOptions, JustifyMode, JustifyModeOrArray } from './types';
import { displayWidth } from '../utils/displayWidth';

export class AlignmentEngineImpl implements AlignmentEngine {
	alignLines(
		lines: string[],
		delimiter: string,
		justify: JustifyModeOrArray,
		options?: AlignmentOptions
	): string[] {
		if (!lines.length || delimiter === '') {
			return [...lines];
		}

		// Apply special handling for equal sign
		const processedLines = this.shouldApplyEqualSignHandling(delimiter)
			? this.preprocessEqualSignLines(lines)
			: lines;

		// For equal sign special handling, use " = " as glue (already normalized in preprocessing)
		const glue = this.shouldApplyEqualSignHandling(delimiter) 
			? ' = ' 
			: this.getDelimiterGlue(delimiter);
		const rows = this.splitLines(processedLines, delimiter);
		const filter = options?.filter;
		const columnWidths = this.computeColumnWidths(rows, filter);
		const columnHasFullwidth = this.computeColumnHasFullwidth(rows);
		const justifyModes = this.normalizeJustifyModes(justify);

		return rows.map((row, rowIndex) => {
			const cells = row.map((cell, colIndex) => {
				const trimmed = cell.trim();
				const shouldAlign = filter
					? filter({
							row: rowIndex,
							ROW: rows.length,
							col: colIndex,
							COL: row.length,
							s: trimmed,
							n: Math.ceil((colIndex + 1) / 2),
							N: Math.ceil(row.length / 2),
						})
					: true;

				if (!shouldAlign) {
					return trimmed;
				}

				const targetWidth = columnWidths[colIndex] ?? displayWidth(trimmed);
				const useFullwidth = columnHasFullwidth[colIndex] ?? false;
				const columnJustify = this.getColumnJustifyMode(justifyModes, colIndex);
				return this.padCell(trimmed, targetWidth, columnJustify, useFullwidth);
			});

			return cells.join(glue).replace(/\s+$/, '');
		});
	}

	private shouldApplyEqualSignHandling(delimiter: string): boolean {
		return delimiter === '=';
	}

	private preprocessEqualSignLines(lines: string[]): string[] {
		// Trim whitespace around equal signs and normalize
		return lines.map((line) => {
			// Match patterns like: =, <=, >=, ==, ===, !=, +=, -=, etc.
			// Replace whitespace around equal sign patterns with single space
			// Use a more careful approach to avoid double replacement
			let processed = line;
			// First pass: normalize spaces around each equal sign pattern
			processed = processed.replace(/\s*([<>!+\-*/%&|^]?=+[<>~]?)\s*/g, ' $1 ');
			// Second pass: collapse all multiple spaces to single space
			processed = processed.replace(/\s{2,}/g, ' ');
			return processed.trim();
		});
	}

	private splitLines(lines: string[], delimiter: string): string[][] {
		if (this.shouldApplyEqualSignHandling(delimiter)) {
			// For equal sign, split by pattern that matches =, <=, >=, ==, ===, etc.
			// The equal sign itself should be the delimiter, not part of the content
			const equalPattern = /([<>!+\-*/%&|^]?=+[<>~]?)/g;
			return lines.map((line) => {
				const parts: string[] = [];
				let lastIndex = 0;
				const matches = Array.from(line.matchAll(equalPattern));

				for (const match of matches) {
					if (match.index === undefined) continue;
					
					// Add part before match (the content before the equal sign)
					if (match.index > lastIndex) {
						parts.push(line.substring(lastIndex, match.index).trim());
					}
					// Don't add the match itself - it's the delimiter
					lastIndex = match.index + match[0].length;
				}

				// Add remaining part (the content after the last equal sign)
				if (lastIndex < line.length) {
					parts.push(line.substring(lastIndex).trim());
				}

				// If no matches found, return the whole line as single part
				if (parts.length === 0) {
					return [line.trim()];
				}

				return parts;
			});
		}

		return lines.map((line) => line.split(delimiter));
	}

	private normalizeJustifyModes(justify: JustifyModeOrArray): JustifyMode[] {
		return Array.isArray(justify) ? justify : [justify];
	}

	private getColumnJustifyMode(justifyModes: JustifyMode[], columnIndex: number): JustifyMode {
		if (justifyModes.length === 0) {
			return 'left';
		}
		return justifyModes[columnIndex % justifyModes.length];
	}

	private getDelimiterGlue(delimiter: string): string {
		if (!delimiter.length) {
			return delimiter;
		}

		const codePoints = [...delimiter];
		const isSingleCodePoint = codePoints.length === 1;
		const isWideDelimiter = isSingleCodePoint && displayWidth(delimiter) > 1;

		return isWideDelimiter ? delimiter : ` ${delimiter} `;
	}

	private computeColumnWidths(rows: string[][], filter?: (data: {
		row: number;
		ROW: number;
		col: number;
		COL: number;
		s: string;
		n: number;
		N: number;
	}) => boolean): number[] {
		const widths: number[] = [];

		rows.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const trimmed = cell.trim();
				const shouldAlign = filter
					? filter({
							row: rowIndex,
							ROW: rows.length,
							col: colIndex,
							COL: row.length,
							s: trimmed,
							n: Math.ceil((colIndex + 1) / 2),
							N: Math.ceil(row.length / 2),
						})
					: true;

				if (shouldAlign) {
					const trimmedWidth = displayWidth(trimmed);
					widths[colIndex] = Math.max(widths[colIndex] ?? 0, trimmedWidth);
				}
			});
		});

		return widths;
	}

	private computeColumnHasFullwidth(rows: string[][]): boolean[] {
		const hasFullwidth: boolean[] = [];

		rows.forEach((row) => {
			row.forEach((cell, index) => {
				const trimmed = cell.trim();
				if (this.hasFullwidthCharacters(trimmed)) {
					hasFullwidth[index] = true;
				}
			});
		});

		return hasFullwidth;
	}

	private hasFullwidthCharacters(value: string): boolean {
		for (let index = 0; index < value.length; index += 1) {
			const codePoint = value.codePointAt(index);
			if (codePoint === undefined) {
				continue;
			}

			if (codePoint > 0xffff) {
				index += 1;
			}

			// Check if it's a full-width character (same logic as displayWidth)
			if (
				codePoint >= 0x1100 &&
				(
					codePoint <= 0x115f ||
					codePoint === 0x2329 ||
					codePoint === 0x232a ||
					(codePoint >= 0x2e80 && codePoint <= 0x3247 && codePoint !== 0x303f) ||
					(codePoint >= 0x3250 && codePoint <= 0x4dbf) ||
					(codePoint >= 0x4e00 && codePoint <= 0xa4c6) ||
					(codePoint >= 0xa960 && codePoint <= 0xa97c) ||
					(codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
					(codePoint >= 0xf900 && codePoint <= 0xfaff) ||
					(codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
					(codePoint >= 0xfe30 && codePoint <= 0xfe6b) ||
					(codePoint >= 0xff01 && codePoint <= 0xff60) ||
					(codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
					(codePoint >= 0x1b000 && codePoint <= 0x1b001) ||
					(codePoint >= 0x1f200 && codePoint <= 0x1f251) ||
					(codePoint >= 0x20000 && codePoint <= 0x3fffd)
				)
			) {
				return true;
			}
		}
		return false;
	}

	private createPadding(displayUnits: number, useFullwidth: boolean): string {
		if (!useFullwidth) {
			return ' '.repeat(displayUnits);
		}

		// Use a mix of full-width spaces (2 units) and regular spaces (1 unit)
		const fullwidthCount = Math.floor(displayUnits / 2);
		const regularCount = displayUnits % 2;
		return '\u3000'.repeat(fullwidthCount) + ' '.repeat(regularCount);
	}

	private padCell(value: string, width: number, justify: JustifyMode, useFullwidthSpace: boolean): string {
		const valueWidth = displayWidth(value);
		if (width <= valueWidth) {
			return value;
		}

		const padding = width - valueWidth;

		switch (justify) {
			case 'right':
				return this.createPadding(padding, useFullwidthSpace) + value;
			case 'center': {
				const leftPad = Math.floor(padding / 2);
				const rightPad = padding - leftPad;
				return this.createPadding(leftPad, useFullwidthSpace) + value + this.createPadding(rightPad, useFullwidthSpace);
			}
			case 'left':
			default:
				return value + this.createPadding(padding, useFullwidthSpace);
		}
	}
}
