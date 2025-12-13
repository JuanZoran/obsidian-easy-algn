/**
 * Strategy for justifying cell content within a column
 */
import type { DisplayWidthOptions } from '../../utils/textMetrics';

export interface JustificationStrategy {
	/**
	 * Pad a cell value to the target width
	 * @param value The cell value to pad
	 * @param targetWidth The target display width
	 * @param useFullwidthSpace Whether to use fullwidth spaces
	 * @param widthOptions Options for display width calculation
	 * @returns The padded value
	 */
	justify(
		value: string,
		targetWidth: number,
		useFullwidthSpace: boolean,
		widthOptions?: DisplayWidthOptions,
	): string;

	/**
	 * Get the mode name (left, right, center)
	 */
	getMode(): string;
}
