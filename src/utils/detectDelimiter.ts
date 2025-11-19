export interface DelimiterDetectionOptions {
	candidates?: string[];
	minMatches?: number;
}

export const COMMON_ALIGNMENT_DELIMITERS = [":", "：", "=", ",", "|", ";"];

export function detectDelimiter(lines: string[], options: DelimiterDetectionOptions = {}): string | undefined {
	const candidates = options.candidates ?? COMMON_ALIGNMENT_DELIMITERS;
	const minMatches = options.minMatches ?? 2;

	let bestScore = 0;
	let bestDelimiter: string | undefined;

	for (const delimiter of candidates) {
		let rowsWithDelimiter = 0;
		const columnCounts: number[] = [];

		for (const line of lines) {
			if (!line.includes(delimiter)) {
				continue;
			}

			rowsWithDelimiter += 1;
			columnCounts.push(line.split(delimiter).length);
		}

		if (rowsWithDelimiter < minMatches) {
			continue;
		}

		const maxCount = Math.max(...columnCounts);
		const minCount = Math.min(...columnCounts);
		const variancePenalty = maxCount - minCount;

		const score = rowsWithDelimiter * 1000 - variancePenalty;
		if (score > bestScore) {
			bestScore = score;
			bestDelimiter = delimiter;
		}
	}

	return bestDelimiter;
}
