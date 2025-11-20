import { AlignmentCustomizationControllerImpl } from '../src/easyAlign/interaction';
import { DEFAULT_ALIGNMENT_SETTINGS } from '../src/easyAlign/defaults';

describe('AlignmentCustomizationControllerImpl', () => {
	it('returns sanitized delimiter and justify data', async () => {
		const controller = new AlignmentCustomizationControllerImpl({
			delimiter: ':',
			justify: 'center',
		});

		controller.setDelimiter(' | ');
		controller.setJustify(['right', 'left']);
		const result = await controller.submit();

		expect(result).toEqual({
			delimiter: '|',
			justify: ['right', 'left'],
		});
		expect(controller.getCurrentState()).toEqual(result);
	});

	it('falls back to defaults when delimiter input is whitespace only', async () => {
		const controller = new AlignmentCustomizationControllerImpl();
		controller.setDelimiter('   ');
		const result = await controller.submit();

		expect(result).toEqual({
			delimiter: DEFAULT_ALIGNMENT_SETTINGS.delimiter,
			justify: DEFAULT_ALIGNMENT_SETTINGS.justify,
		});
	});
});
