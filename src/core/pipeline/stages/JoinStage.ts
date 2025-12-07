import type { ProcessingStage } from '../ProcessingStage';
import { AlignmentContext } from '../../alignment/AlignmentContext';
import { Row } from '../../models/Row';
import { DelimiterStrategyFactory } from '../../strategies/delimiter/DelimiterStrategyFactory';

/**
 * Stage that joins cells back into lines
 */
export class JoinStage implements ProcessingStage<Row[], string[]> {
	process(input: Row[], context: AlignmentContext): string[] {
		const delimiterStrategy = DelimiterStrategyFactory.create(context.delimiter);
		const glue = delimiterStrategy.createGlue({
			delimiter: context.delimiter,
			addSpaces: context.options.addSpacesAroundDelimiter !== false,
			useFullwidthSpaces: context.options.useFullwidthSpaces === true,
		});

		return input.map(row => {
			const cellValues = row.cells.map(cell => cell.value);
			const joined = cellValues.join(glue).replace(/\s+$/, '');
			return joined;
		});
	}

	getName(): string {
		return 'JoinStage';
	}
}
