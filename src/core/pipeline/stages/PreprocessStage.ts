import type { ProcessingStage } from '../ProcessingStage';
import { AlignmentContext } from '../../alignment/AlignmentContext';
import { Row } from '../../models/Row';
import { Cell } from '../../models/Cell';

/**
 * Stage that preprocesses cells (trimming, normalization)
 */
export class PreprocessStage implements ProcessingStage<Row[], Row[]> {
	process(input: Row[], context: AlignmentContext): Row[] {
		const shouldTrim = context.options.trimWhitespace !== false;

		return input.map(row => {
			if (!shouldTrim) {
				return row;
			}

			const processedCells = row.cells.map(cell => {
				const trimmed = cell.value.trim();
				return new Cell(trimmed, cell.originalValue, cell.rowIndex, cell.columnIndex);
			});

			return new Row(processedCells, row.index, row.originalLine);
		});
	}

	getName(): string {
		return 'PreprocessStage';
	}
}
