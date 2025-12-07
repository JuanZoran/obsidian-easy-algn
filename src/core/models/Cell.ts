/**
 * Represents a single cell in a table row
 */
export class Cell {
	constructor(
		public readonly value: string,
		public readonly originalValue: string = value,
		public readonly rowIndex: number = 0,
		public readonly columnIndex: number = 0,
	) {}

	/**
	 * Get the display width of the cell content
	 */
	getDisplayWidth(calculateWidth: (text: string) => number): number {
		return calculateWidth(this.value);
	}

	/**
	 * Create a new cell with updated value
	 */
	withValue(newValue: string): Cell {
		return new Cell(newValue, this.originalValue, this.rowIndex, this.columnIndex);
	}

	/**
	 * Check if cell should be aligned
	 */
	shouldAlign(filter?: (cell: Cell) => boolean): boolean {
		if (!filter) return true;
		return filter(this);
	}
}
