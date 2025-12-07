import type { DelimiterStrategy } from '../strategies/delimiter/DelimiterStrategy';
import type { JustificationStrategy } from '../strategies/justification/JustificationStrategy';
import { DelimiterStrategyFactory } from '../strategies/delimiter/DelimiterStrategyFactory';
import { JustificationStrategyFactory } from '../strategies/justification/JustificationStrategyFactory';

/**
 * Registry for plugin extensions
 */
export class ExtensionRegistry {
	/**
	 * Register a custom delimiter strategy
	 * @param strategy The delimiter strategy to register
	 * @param priority Priority (higher = checked first). Default: 0
	 */
	static registerDelimiterStrategy(strategy: DelimiterStrategy, priority: number = 0): void {
		DelimiterStrategyFactory.registerStrategy(strategy, priority);
	}

	/**
	 * Register a custom justification strategy
	 * @param mode The mode name (e.g., 'left', 'right', 'center')
	 * @param strategy The justification strategy to register
	 */
	static registerJustificationStrategy(mode: string, strategy: JustificationStrategy): void {
		JustificationStrategyFactory.registerStrategy(mode, strategy);
	}
}
