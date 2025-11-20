import { AlignmentRule, AlignmentService, AlignmentStore } from './types';

export class AlignmentServiceImpl implements AlignmentService {
	private rules: AlignmentRule[] = [];

	constructor(private readonly store: AlignmentStore) {}

	async load(): Promise<void> {
		this.rules = await this.store.loadRules();
	}

	getRuleById(id: string): AlignmentRule | undefined {
		return this.rules.find((rule) => rule.id === id);
	}

	getAllRules(): AlignmentRule[] {
		return [...this.rules];
	}
}
