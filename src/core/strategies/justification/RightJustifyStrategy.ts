import type { JustificationStrategy } from './JustificationStrategy';
import { createPadding } from '../../utils/textMetrics';
import { calculateDisplayWidth } from '../../utils/textMetrics';

/**
 * Strategy for right-justifying cell content
 */
export class RightJustifyStrategy implements JustificationStrategy {
	justify(value: string, targetWidth: number, useFullwidthSpace: boolean): string {
		const valueWidth = calculateDisplayWidth(value);
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
