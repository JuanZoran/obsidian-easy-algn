import type { JustificationStrategy } from './JustificationStrategy';
import { createPadding, calculateDisplayWidth } from '../../utils/textMetrics';

/**
 * Strategy for left-justifying cell content
 */
export class LeftJustifyStrategy implements JustificationStrategy {
	justify(value: string, targetWidth: number, useFullwidthSpace: boolean): string {
		const valueWidth = calculateDisplayWidth(value);
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
