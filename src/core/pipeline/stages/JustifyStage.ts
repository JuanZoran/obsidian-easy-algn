import type { ProcessingStage } from '../ProcessingStage';
import { AlignmentContext } from '../../alignment/AlignmentContext';
import { Row } from '../../models/Row';
import { Cell } from '../../models/Cell';
import { JustificationStrategyFactory } from '../../strategies/justification/JustificationStrategyFactory';
import type { FilterPredicate } from '../../../easyAlign/types';

/**
 * Stage that applies justification to cells
 */
export class JustifyStage implements ProcessingStage<Row[], Row[]> {
	process(input: Row[], context: AlignmentContext): Row[] {
		const columnWidths = context.getMetadata<number[]>('columnWidths') ?? [];
		const useFullwidthSpaces = context.options.useFullwidthSpaces === true;
		const filter = context.options.filter;

		return input.map(row => {
			const rowLength = row.getColumnCount();
			const justifiedCells = row.cells.map((cell, colIndex) => {
				// Check if cell should be aligned
				let shouldAlign = true;
				if (filter) {
					shouldAlign = filter({
						row: row.index,
						ROW: input.length,
						col: colIndex,
						COL: rowLength,
						s: cell.value,
						n: Math.ceil((colIndex + 1) / 2),
						N: Math.ceil(rowLength / 2),
					});
				}

				if (!shouldAlign) {
					return cell;
				}

				const targetWidth = columnWidths[colIndex] ?? 0;
				if (targetWidth <= 0) {
					return cell;
				}

				const strategy = JustificationStrategyFactory.getForColumn(
					context.justify,
					colIndex,
				);

				const justifiedValue = strategy.justify(
					cell.value,
					targetWidth,
					useFullwidthSpaces,
					context.options,
				);
				return cell.withValue(justifiedValue);
			});

			return row.withCells(justifiedCells);
		});
	}

	getName(): string {
		return 'JustifyStage';
	}
}
