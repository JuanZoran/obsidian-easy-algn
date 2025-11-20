export interface AlignmentRule {
	id: string;
	trigger: string;
	description: string;
}

export interface AlignmentStore {
	loadRules(): Promise<AlignmentRule[]>;
}

export interface AlignmentService {
	load(): Promise<void>;
	getRuleById(id: string): AlignmentRule | undefined;
	getAllRules(): AlignmentRule[];
}

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
