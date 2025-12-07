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
	trimWhitespace?: boolean;
	addSpacesAroundDelimiter?: boolean;
	useFullwidthSpaces?: boolean;
}

// AlignmentEngine is now exported from core/alignment/AlignmentEngine
// Re-export for backward compatibility
export type { AlignmentEngine } from '../core/alignment/AlignmentEngine';

export interface AlignmentSettingsData {
	delimiter: string;
	justify: JustifyModeOrArray;
}
