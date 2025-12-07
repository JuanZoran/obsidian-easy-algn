import type { JustificationStrategy } from './JustificationStrategy';
import { LeftJustifyStrategy } from './LeftJustifyStrategy';
import { RightJustifyStrategy } from './RightJustifyStrategy';
import { CenterJustifyStrategy } from './CenterJustifyStrategy';

/**
 * Factory for creating justification strategies
 */
export class JustificationStrategyFactory {
	private static readonly strategies = new Map<string, JustificationStrategy>([
		['left', new LeftJustifyStrategy()],
		['right', new RightJustifyStrategy()],
		['center', new CenterJustifyStrategy()],
	]);

	/**
	 * Create a strategy for the given mode
	 */
	static create(mode: string): JustificationStrategy {
		const strategy = this.strategies.get(mode.toLowerCase());
		if (!strategy) {
			// Default to left if mode is unknown
			return this.strategies.get('left')!;
		}
		return strategy;
	}

	/**
	 * Get strategy for a column index (handles array of modes)
	 */
	static getForColumn(modes: string | string[], columnIndex: number): JustificationStrategy {
		const modeArray = Array.isArray(modes) ? modes : [modes];
		if (modeArray.length === 0) {
			return this.create('left');
		}
		const mode = modeArray[columnIndex % modeArray.length];
		return this.create(mode);
	}

	/**
	 * Register a custom strategy (for extension points)
	 */
	static registerStrategy(mode: string, strategy: JustificationStrategy): void {
		this.strategies.set(mode.toLowerCase(), strategy);
	}
}
