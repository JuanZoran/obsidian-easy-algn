import { AlignmentEngineImpl } from '../src/easyAlign/engine';
import { displayWidth } from '../src/utils/displayWidth';

describe('Colon alignment bug', () => {
	let engine: AlignmentEngineImpl;

	beforeEach(() => {
		engine = new AlignmentEngineImpl();
	});

	it('should align colon at the same column position', () => {
		// User's actual input - note the spacing differences
		const lines = ['- status : ||n. 地位||', '- check  : ||n.抑制||'];
		
		const aligned = engine.alignLines(lines, ':', 'left');

		// Check that colons are at the same display position
		const colonPositions = aligned.map((line) => {
			const colonIndex = line.indexOf(':');
			if (colonIndex < 0) return { pos: -1, beforeColon: '', width: -1 };
			const beforeColon = line.substring(0, colonIndex);
			const width = displayWidth(beforeColon);
			return { pos: colonIndex, beforeColon, width };
		});

		// All colons should be at the same display position
		const widths = colonPositions.map(info => info.width);
		expect(widths.every((w) => w === widths[0] && w >= 0)).toBe(true);
		
		// Also verify that the output is different from input (alignment actually happened)
		const inputColonPositions = lines.map((line) => {
			const colonIndex = line.indexOf(':');
			const beforeColon = line.substring(0, colonIndex);
			return displayWidth(beforeColon);
		});
		
		// If input widths are different, output should align them
		if (inputColonPositions[0] !== inputColonPositions[1]) {
			expect(aligned[0] !== lines[0] || aligned[1] !== lines[1]).toBe(true);
		}
		
		// Also verify the actual visual alignment
		// Split by " : " to check
		const parts = aligned.map(line => line.split(' : '));
		expect(parts.every(p => p.length === 2)).toBe(true);
		
		const leftParts = parts.map(p => p[0] ?? '');
		const leftWidths = leftParts.map(part => displayWidth(part));
		
		// All left parts should have the same display width
		expect(leftWidths.every((width) => width === leftWidths[0])).toBe(true);
	});
});

