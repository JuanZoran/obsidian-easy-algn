import type { ProcessingStage } from '../ProcessingStage';
import { AlignmentContext } from '../../alignment/AlignmentContext';
import { Row } from '../../models/Row';
import { calculateDisplayWidth } from '../../utils/textMetrics';
import type { FilterPredicate } from '../../../easyAlign/types';

/**
 * Stage that measures column widths
 */
export class MeasureStage implements ProcessingStage<Row[], Row[]> {
	process(input: Row[], context: AlignmentContext): Row[] {
		if (input.length === 0) {
			return input;
		}

		// Calculate max width for each column
		const columnWidths: number[] = [];
		const filter = context.options.filter;

		input.forEach(row => {
			const rowLength = row.getColumnCount();
			row.cells.forEach((cell, colIndex) => {
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

				if (shouldAlign) {
					const cellWidth = calculateDisplayWidth(cell.value);
					const currentMax = columnWidths[colIndex] ?? 0;
					columnWidths[colIndex] = Math.max(currentMax, cellWidth);
				}
			});
		});

		// Store column widths in context metadata for subsequent stages
		// The metadata Map is shared, so we can mutate it directly
		// This allows subsequent stages to read the column widths
		context.metadata.set('columnWidths', columnWidths);

		// Return rows unchanged (measurement is stored in context)
		return input;
	}

	getName(): string {
		return 'MeasureStage';
	}
}
