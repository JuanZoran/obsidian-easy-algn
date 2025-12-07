import type { JustificationStrategy } from './JustificationStrategy';
import { createPadding, calculateDisplayWidth } from '../../utils/textMetrics';

/**
 * Strategy for center-justifying cell content
 */
export class CenterJustifyStrategy implements JustificationStrategy {
	justify(value: string, targetWidth: number, useFullwidthSpace: boolean): string {
		const valueWidth = calculateDisplayWidth(value);
		if (targetWidth <= valueWidth) {
			return value;
		}

		const padding = targetWidth - valueWidth;
		const leftPad = Math.floor(padding / 2);
		const rightPad = padding - leftPad;
		return createPadding(leftPad, useFullwidthSpace) + value + createPadding(rightPad, useFullwidthSpace);
	}

	getMode(): string {
		return 'center';
	}
}
