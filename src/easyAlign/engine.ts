import type { AlignmentEngine, AlignmentOptions, JustifyMode, JustifyModeOrArray } from './types';
import { displayWidth, isFullwidthCodePoint } from '../utils/displayWidth';

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

		// Cache equal sign handling check to avoid repeated calls
		const isEqualSign = this.shouldApplyEqualSignHandling(delimiter);
		
		// Apply special handling for equal sign
		const processedLines = isEqualSign
			? this.preprocessEqualSignLines(lines)
			: lines;

		// Determine if spaces should be added around delimiter
		const addSpaces = options?.addSpacesAroundDelimiter !== false; // Default to true for backward compatibility
		const useFullwidthSpaces = options?.useFullwidthSpaces === true;
		
		// For equal sign special handling, use " = " or "=" based on addSpaces option
		const glue = isEqualSign
			? this.getEqualGlue(addSpaces, useFullwidthSpaces)
			: this.getDelimiterGlue(delimiter, addSpaces, useFullwidthSpaces);
		const rows = this.splitLines(processedLines, delimiter, isEqualSign);
		
		// Pre-trim all cells once to avoid repeated trim() calls
		// Only trim if trimWhitespace option is true (defaults to true for backward compatibility)
		const shouldTrim = options?.trimWhitespace !== false;
		const trimmedRows = shouldTrim
			? rows.map(row => row.map(cell => cell.trim()))
			: rows;
		
		const filter = options?.filter;
		// Cache filter results to avoid duplicate calls
		const filterCache = new Map<string, boolean>();
		const getFilterResult = (rowIndex: number, colIndex: number, trimmed: string, rowLength: number): boolean => {
			if (!filter) return true;
			const key = `${rowIndex},${colIndex}`;
			if (filterCache.has(key)) {
				return filterCache.get(key)!;
			}
			const result = filter({
				row: rowIndex,
				ROW: trimmedRows.length,
				col: colIndex,
				COL: rowLength,
				s: trimmed,
				n: Math.ceil((colIndex + 1) / 2),
				N: Math.ceil(rowLength / 2),
			});
			filterCache.set(key, result);
			return result;
		};
		
		const { columnWidths } = this.computeColumnMetrics(trimmedRows, getFilterResult);
		const justifyModes = this.normalizeJustifyModes(justify);

		return trimmedRows.map((row, rowIndex) => {
			const cells = row.map((cell, colIndex) => {
				const shouldAlign = getFilterResult(rowIndex, colIndex, cell, row.length);

				if (!shouldAlign) {
					return cell;
				}

				const targetWidth = columnWidths[colIndex] ?? displayWidth(cell);
				const columnJustify = this.getColumnJustifyMode(justifyModes, colIndex);
				const padded = this.padCell(cell, targetWidth, columnJustify, useFullwidthSpaces);
				return padded;
			});

			const joined = cells.join(glue).replace(/\s+$/, '');
			return joined;
		});
	}

	private shouldApplyEqualSignHandling(delimiter: string): boolean {
		return delimiter === '=';
	}

	private preprocessEqualSignLines(lines: string[]): string[] {
		// Normalize whitespace around equal sign patterns (=, <=, >=, ==, etc.)
		// Replace whitespace around equal sign patterns with single space, then collapse multiple spaces
		const equalPattern = /\s*([<>!+\-*/%&|^]?=+[<>~]?)\s*/g;
		return lines.map((line) => {
			return line.replace(equalPattern, ' $1 ').replace(/\s{2,}/g, ' ').trim();
		});
	}

	private splitLines(lines: string[], delimiter: string, isEqualSign?: boolean): string[][] {
		const shouldHandleEqual = isEqualSign ?? this.shouldApplyEqualSignHandling(delimiter);
		if (shouldHandleEqual) {
			// For equal sign, split by pattern that matches =, <=, >=, ==, ===, etc.
			const equalPattern = /([<>!+\-*/%&|^]?=+[<>~]?)/g;
			return lines.map((line) => {
				const parts: string[] = [];
				let lastIndex = 0;

				for (const match of line.matchAll(equalPattern)) {
					if (match.index === undefined) continue;
					
					// Add part before match
					if (match.index > lastIndex) {
						parts.push(line.substring(lastIndex, match.index).trim());
					}
					lastIndex = match.index + match[0].length;
				}

				// Add remaining part
				if (lastIndex < line.length) {
					parts.push(line.substring(lastIndex).trim());
				}

				return parts.length > 0 ? parts : [line.trim()];
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

	private getEqualGlue(addSpaces: boolean, useFullwidthSpaces: boolean): string {
		if (!addSpaces) {
			return '=';
		}
		const space = useFullwidthSpaces ? '　' : ' ';
		return `${space}=${space}`;
	}

	private getDelimiterGlue(delimiter: string, addSpaces: boolean = true, useFullwidthSpaces: boolean = false): string {
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

	private computeColumnMetrics(
		trimmedRows: string[][],
		getFilterResult: (rowIndex: number, colIndex: number, trimmed: string, rowLength: number) => boolean
	): { columnWidths: number[]; columnHasFullwidth: boolean[] } {
		const widths: number[] = [];
		const hasFullwidth: boolean[] = [];

		trimmedRows.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const shouldAlign = getFilterResult(rowIndex, colIndex, cell, row.length);

				if (shouldAlign) {
					const cellWidth = displayWidth(cell);
					widths[colIndex] = Math.max(widths[colIndex] ?? 0, cellWidth);
				}

				if (this.hasFullwidthCharacters(cell)) {
					hasFullwidth[colIndex] = true;
				}
			});
		});

		return { columnWidths: widths, columnHasFullwidth: hasFullwidth };
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

			if (isFullwidthCodePoint(codePoint)) {
				return true;
			}
		}
		return false;
	}

	private createPadding(displayUnits: number, useFullwidth: boolean): string {
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
