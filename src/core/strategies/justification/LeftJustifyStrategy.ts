import type { JustificationStrategy } from './JustificationStrategy';
import type { DisplayWidthOptions } from '../../utils/textMetrics';
import { createPadding, calculateDisplayWidth } from '../../utils/textMetrics';

/**
 * Strategy for left-justifying cell content
 */
export class LeftJustifyStrategy implements JustificationStrategy {
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
		return value + createPadding(padding, useFullwidthSpace);
	}

	getMode(): string {
		return 'left';
	}

}
