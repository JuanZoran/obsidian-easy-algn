import type { DelimiterStrategy } from './DelimiterStrategy';
import { SimpleDelimiterStrategy } from './SimpleDelimiterStrategy';
import { EqualSignStrategy } from './EqualSignStrategy';

/**
 * Factory for creating delimiter strategies based on delimiter string
 */
export class DelimiterStrategyFactory {
	private static readonly strategies: DelimiterStrategy[] = [
		new EqualSignStrategy(),
		new SimpleDelimiterStrategy(),
	];

	/**
	 * Create a strategy for the given delimiter
	 */
	static create(delimiter: string): DelimiterStrategy {
		// Try each strategy to see if it can handle this delimiter
		for (const strategy of this.strategies) {
			if (strategy.canHandle(delimiter)) {
				// For SimpleDelimiterStrategy, we need to set the delimiter
				if (strategy instanceof SimpleDelimiterStrategy) {
					return SimpleDelimiterStrategy.forDelimiter(delimiter);
				}
				return strategy;
			}
		}

		// Fallback to simple strategy
		return SimpleDelimiterStrategy.forDelimiter(delimiter);
	}

	/**
	 * Register a custom strategy (for extension points)
	 */
	static registerStrategy(strategy: DelimiterStrategy, priority: number = 0): void {
		// Higher priority strategies are checked first
		this.strategies.splice(priority, 0, strategy);
	}
}
