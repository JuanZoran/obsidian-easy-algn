import type { ProcessingStage } from '../ProcessingStage';
import { AlignmentContext } from '../../alignment/AlignmentContext';
import { Row } from '../../models/Row';
import { Cell } from '../../models/Cell';
import { DelimiterStrategyFactory } from '../../strategies/delimiter/DelimiterStrategyFactory';

/**
 * Stage that splits text lines into rows of cells
 */
export class SplitStage implements ProcessingStage<string[], Row[]> {
	process(input: string[], context: AlignmentContext): Row[] {
		// Get delimiter strategy for this delimiter
		const delimiterStrategy = DelimiterStrategyFactory.create(context.delimiter);

		return input.map((line, rowIndex) => {
			const parts = delimiterStrategy.split(line);
			const cells = parts.map((part, colIndex) => {
				return new Cell(part, part, rowIndex, colIndex);
			});
			return new Row(cells, rowIndex, line);
		});
	}

	getName(): string {
		return 'SplitStage';
	}
}
