import { Cell } from './Cell';

/**
 * Represents a row of cells
 */
export class Row {
	constructor(
		public readonly cells: Cell[],
		public readonly index: number = 0,
		public readonly originalLine: string = '',
	) {}

	/**
	 * Get cell at specific column index
	 */
	getCell(columnIndex: number): Cell | undefined {
		return this.cells[columnIndex];
	}

	/**
	 * Get number of cells
	 */
	getColumnCount(): number {
		return this.cells.length;
	}

	/**
	 * Create a new row with updated cells
	 */
	withCells(newCells: Cell[]): Row {
		return new Row(newCells, this.index, this.originalLine);
	}

	/**
	 * Create a new row with a single updated cell
	 */
	withCellAt(columnIndex: number, newCell: Cell): Row {
		const newCells = [...this.cells];
		newCells[columnIndex] = newCell;
		return new Row(newCells, this.index, this.originalLine);
	}
}
