import type { JustificationStrategy } from './JustificationStrategy';
import type { DisplayWidthOptions } from '../../utils/textMetrics';
import { createPadding, calculateDisplayWidth } from '../../utils/textMetrics';

/**
 * Strategy for right-justifying cell content
 */
export class RightJustifyStrategy implements JustificationStrategy {
	justify(
		value: string,
		targetWidth: number,
		useFullwidthSpace: boolean,
		widthOptions?: DisplayWidthOptions,
	): string {
		const valueWidth = calculateDisplayWidth(value, widthOptions);
		if (targetWidth <= valueWidth) {
			return value;
		}

		const padding = targetWidth - valueWidth;
		return createPadding(padding, useFullwidthSpace) + value;
	}

	getMode(): string {
		return 'right';
	}
}
