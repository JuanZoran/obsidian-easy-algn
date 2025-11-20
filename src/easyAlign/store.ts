import { AlignmentRule, AlignmentStore } from './types';

const DEFAULT_RULES: AlignmentRule[] = [
	{
		id: 'default',
		trigger: 'ga',
		description: 'Default EasyAlign rule set.',
	},
];

export class InMemoryAlignmentStore implements AlignmentStore {
	constructor(private readonly rules: AlignmentRule[] = DEFAULT_RULES) {}

	async loadRules(): Promise<AlignmentRule[]> {
		return [...this.rules];
	}
}
