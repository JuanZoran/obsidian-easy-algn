/**
 * Strategy for justifying cell content within a column
 */
export interface JustificationStrategy {
	/**
	 * Pad a cell value to the target width
	 * @param value The cell value to pad
	 * @param targetWidth The target display width
	 * @param useFullwidthSpace Whether to use fullwidth spaces
	 * @returns The padded value
	 */
	justify(value: string, targetWidth: number, useFullwidthSpace: boolean): string;

	/**
	 * Get the mode name (left, right, center)
	 */
	getMode(): string;
}
