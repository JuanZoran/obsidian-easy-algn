import type { ProcessingStage } from '../ProcessingStage';
import { AlignmentContext } from '../../alignment/AlignmentContext';
import { Row } from '../../models/Row';
import { Cell } from '../../models/Cell';
import type { FilterPredicate } from '../../../easyAlign/types';

/**
 * Stage that filters cells based on predicate
 */
export class FilterStage implements ProcessingStage<Row[], Row[]> {
	process(input: Row[], context: AlignmentContext): Row[] {
		const filter = context.options.filter;
		if (!filter) {
			return input;
		}

		// Create a filter function for cells
		const cellFilter = (cell: Cell, rowIndex: number, colIndex: number, rowLength: number, totalRows: number): boolean => {
			return filter({
				row: rowIndex,
				ROW: totalRows,
				col: colIndex,
				COL: rowLength,
				s: cell.value,
				n: Math.ceil((colIndex + 1) / 2),
				N: Math.ceil(rowLength / 2),
			});
		};

		const totalRows = input.length;
		return input.map(row => {
			const rowLength = row.getColumnCount();
			const filteredCells = row.cells.map((cell, colIndex) => {
				const shouldAlign = cellFilter(cell, row.index, colIndex, rowLength, totalRows);
				// Mark cells that shouldn't be aligned (we'll skip them in justification)
				return cell;
			});

			// Store filter result in metadata
			const metadata = new Map<string, boolean>();
			row.cells.forEach((cell, colIndex) => {
				const shouldAlign = cellFilter(cell, row.index, colIndex, rowLength, totalRows);
				metadata.set(`align_${row.index}_${colIndex}`, shouldAlign);
			});

			return new Row(filteredCells, row.index, row.originalLine);
		});
	}

	getName(): string {
		return 'FilterStage';
	}
}
