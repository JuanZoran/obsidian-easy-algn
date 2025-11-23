export type JustifyMode = 'left' | 'center' | 'right';

export type JustifyModeOrArray = JustifyMode | JustifyMode[];

export type FilterPredicate = (data: {
	row: number;
	ROW: number;
	col: number;
	COL: number;
	s: string;
	n: number;
	N: number;
}) => boolean;

export interface AlignmentOptions {
	filter?: FilterPredicate;
}

export interface AlignmentEngine {
	alignLines(
		lines: string[],
		delimiter: string,
		justify: JustifyModeOrArray,
		options?: AlignmentOptions
	): string[];
}

export interface AlignmentSettingsData {
	delimiter: string;
	justify: JustifyModeOrArray;
}
