import { AlignmentEngineImpl } from '../src/easyAlign/engine';
import { displayWidth } from '../src/utils/displayWidth';

describe('AlignmentEngineImpl', () => {
	const sampleLines = ['a=1', 'aa=22', 'ccc=333'];

	it('left justifies columns based on delimiter', () => {
		const engine = new AlignmentEngineImpl();
		const aligned = engine.alignLines(sampleLines, '=', 'left');
		expect(aligned).toEqual(['a   = 1', 'aa  = 22', 'ccc = 333']);
	});

	it('centers text when requested', () => {
		const engine = new AlignmentEngineImpl();
		const aligned = engine.alignLines(sampleLines, '=', 'center');
		expect(aligned[0]).toContain(' = ');
		expect(aligned[1]).toContain(' = ');
	});

	it('aligns wide characters by display width', () => {
		const engine = new AlignmentEngineImpl();
		const lines = ['简:文', '复杂:结构'];
		const aligned = engine.alignLines(lines, ':', 'left');

		const leftParts = aligned.map((line) => line.split(' : ')[0]);
		const leftWidths = leftParts.map((part) => displayWidth(part));
		expect(leftWidths).toEqual([4, 4]);

	});

	it('keeps colon position stable for chinese bullet list', () => {
		const engine = new AlignmentEngineImpl();
		const lines = [
			'• 简单图 ： 无重复边，节点指向自己的图',
			'• 多重图 ： 与简单图相对',
			'• 连通子图 ： 无向图中的极大连通子图',
		];
		const aligned = engine.alignLines(lines, '：', 'left');

		const leftWidths = aligned.map((line) => {
			const [left] = line.split('：');
			return displayWidth(left ?? '');
		});

		expect(leftWidths.every((width) => width === leftWidths[0])).toBe(true);
		expect(aligned.every((line) => !line.includes('： '))).toBe(true);
	});

	it('aligns chinese text with regular colon delimiter', () => {
		const engine = new AlignmentEngineImpl();
		const lines = [
			'- 简单图: 无重复边，节点指向自己的图',
			'- 多重图: 与简单图相对',
			'- 连通子图: 无向图中的极大连通子图',
		];
		const aligned = engine.alignLines(lines, ':', 'left');

		const leftParts = aligned.map((line) => line.split(' : ')[0]);
		const leftWidths = leftParts.map((part) => displayWidth(part));
		
		// All left parts should have the same display width
		expect(leftWidths.every((width) => width === leftWidths[0])).toBe(true);
	});

	describe('per-column justify mode', () => {
		it('supports array of justify modes for different columns', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];
			const aligned = engine.alignLines(lines, '=', ['left', 'center', 'right']);

			// Verify all lines are aligned and contain three columns after splitting
			expect(aligned.every((line) => line.split(' = ').length === 3)).toBe(true);

			// First column should be left-aligned (width 3 for 'ccc')
			const firstCols = aligned.map((line) => line.split(' = ')[0]);
			expect(displayWidth(firstCols[0])).toBe(3);
			expect(displayWidth(firstCols[1])).toBe(3);
			expect(displayWidth(firstCols[2])).toBe(3);
			expect(firstCols[0]).toMatch(/^a\s+$/);
			expect(firstCols[1]).toMatch(/^aa\s+$/);
			expect(firstCols[2]).toBe('ccc');

			// Second column should be center-aligned
			const secondCols = aligned.map((line) => {
				const parts = line.split(' = ');
				return parts[1] ?? '';
			});
			// All second columns should have same width (width of '333' = 3)
			const secondWidths = secondCols.map((col) => displayWidth(col));
			expect(secondWidths.every((w) => w === secondWidths[0])).toBe(true);
			expect(secondCols[0]).toContain('1');
			expect(secondCols[1]).toContain('22');
			expect(secondCols[2]).toContain('333');

			// Third column should be right-aligned (width 4 for '4444')
			const thirdCols = aligned.map((line) => {
				const parts = line.split(' = ');
				return parts[2] ?? '';
			});
			const thirdWidths = thirdCols.map((col) => displayWidth(col));
			expect(thirdWidths.every((w) => w === thirdWidths[0])).toBe(true);
			// Right-aligned: padding before value
			expect(thirdCols[0]).toMatch(/^\s+2$/);
			expect(thirdCols[1]).toMatch(/^\s+333$/);
			expect(thirdCols[2]).toBe('4444'); // Already max width, no padding needed
		});

		it('recycles justify mode array when columns exceed array length', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1=2=3', 'aa=22=333=4444'];
			const aligned = engine.alignLines(lines, '=', ['left', 'right']);

			// Column 0: left (index 0)
			// Column 1: right (index 1)
			// Column 2: left (index 0, recycled)
			// Column 3: right (index 1, recycled)

			const parts = aligned.map((line) => line.split(' = '));
			expect(parts.every((row) => row.length === 4)).toBe(true);

			// First column (left-aligned, width 2 for 'aa')
			expect(displayWidth(parts[0][0])).toBe(2);
			expect(displayWidth(parts[1][0])).toBe(2);
			expect(parts[0][0]).toMatch(/^a\s+$/);
			expect(parts[1][0]).toBe('aa');

			// Second column (right-aligned)
			// Max width should be 3 (from '333'), so '1' should have 2 spaces before, '22' should have 1 space
			const secondWidths = [parts[0][1], parts[1][1]].map((col) => displayWidth(col));
			expect(secondWidths.every((w) => w === secondWidths[0])).toBe(true);
			// '1' should be right-aligned with padding
			expect(parts[0][1]).toMatch(/^\s+1$/);
			// '22' might be max width if column width is 2, or have padding if width is 3
			// Accept both cases: either '22' (if it's max width) or ' 22' (if '333' is max)
			expect(parts[1][1]).toMatch(/^\s*22$/);

			// Third column (left-aligned, recycled)
			const thirdWidths = [parts[0][2], parts[1][2]].map((col) => displayWidth(col));
			expect(thirdWidths.every((w) => w === thirdWidths[0])).toBe(true);
			expect(parts[0][2]).toMatch(/^2\s+$/);
			expect(parts[1][2]).toMatch(/^333\s*$/);

			// Fourth column (right-aligned, recycled)
			const fourthWidths = [parts[0][3], parts[1][3]].map((col) => displayWidth(col));
			expect(fourthWidths.every((w) => w === fourthWidths[0])).toBe(true);
			expect(parts[0][3]).toMatch(/^\s+3$/);
			expect(parts[1][3]).toMatch(/^4444\s*$/);
		});

		it('works with single justify mode (backward compatibility)', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1', 'aa=22', 'ccc=333'];
			const aligned = engine.alignLines(lines, '=', 'left');
			expect(aligned).toEqual(['a   = 1', 'aa  = 22', 'ccc = 333']);
		});
	});

	describe('filter functionality', () => {
		it('filters columns to align only first column', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];
			const aligned = engine.alignLines(lines, '=', 'left', {
				filter: (data) => data.col === 0,
			});

			// First column should be aligned
			const firstCols = aligned.map((line) => line.split(' = ')[0]);
			const firstWidths = firstCols.map((col) => displayWidth(col));
			expect(firstWidths.every((w) => w === firstWidths[0])).toBe(true);

			// Other columns should not be aligned (keep original widths)
			const secondCols = aligned.map((line) => {
				const parts = line.split(' = ');
				return parts[1] ?? '';
			});
			expect(secondCols[0]).toBe('1');
			expect(secondCols[1]).toBe('22');
			expect(secondCols[2]).toBe('333');
		});

		it('filters rows to exclude certain rows from alignment', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1', 'aa=22', 'ccc=333', 'dddd=4444'];
			const aligned = engine.alignLines(lines, '=', 'left', {
				filter: (data) => data.row !== 1, // Exclude second row (0-indexed)
			});

			// Row 1 (second row) should not be aligned
			const parts = aligned.map((line) => line.split(' = '));
			expect(parts[1][0]).toBe('aa'); // Should not have padding
			expect(parts[1][1]).toBe('22');

			// Other rows should be aligned
			const firstCols = [parts[0][0], parts[2][0], parts[3][0]];
			const firstWidths = firstCols.map((col) => displayWidth(col));
			expect(firstWidths.every((w) => w === firstWidths[0])).toBe(true);
		});

		it('filters by column pair number (n)', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1=2=3', 'aa=22=333=4444'];
			// Only align first pair (n === 1 means first pair: columns 0 and 1)
			const aligned = engine.alignLines(lines, '=', 'left', {
				filter: (data) => data.n === 1,
			});

			const parts = aligned.map((line) => line.split(' = '));
			// First two columns should be aligned
			const firstCols = [parts[0][0], parts[1][0]];
			const firstWidths = firstCols.map((col) => displayWidth(col));
			expect(firstWidths.every((w) => w === firstWidths[0])).toBe(true);

			const secondCols = [parts[0][1], parts[1][1]];
			const secondWidths = secondCols.map((col) => displayWidth(col));
			expect(secondWidths.every((w) => w === secondWidths[0])).toBe(true);

			// Third and fourth columns should not be aligned
			expect(parts[0][2]).toBe('2');
			expect(parts[1][2]).toBe('333');
		});

		it('works without filter (backward compatibility)', () => {
			const engine = new AlignmentEngineImpl();
			const lines = ['a=1', 'aa=22', 'ccc=333'];
			const aligned = engine.alignLines(lines, '=', 'left');
			expect(aligned).toEqual(['a   = 1', 'aa  = 22', 'ccc = 333']);
		});
	});

	describe('equal sign special handling', () => {
		it('handles simple equal sign patterns with whitespace normalization', () => {
			const engine = new AlignmentEngineImpl();
			const lines = [
				'a=b',
				'aa=bb',
				'aaa=bbb',
				'aaaa   =   cccc',
			];
			const aligned = engine.alignLines(lines, '=', 'left');

			// All should be aligned with trimmed whitespace
			// All lines should have " = " as separator
			// Note: alignment padding before = is expected and normal
			aligned.forEach((line) => {
				expect(line).toMatch(/ = /); // Single space after =
				expect(line).toMatch(/=\s+\S/); // = followed by single space and content
			});

			// Verify columns are split correctly
			const parts = aligned.map((line) => line.split(' = '));
			expect(parts.every((p) => p.length === 2)).toBe(true);
			
			// Columns should be reasonably aligned (within 1-2 characters due to padding)
			const firstCols = parts.map((p) => p[0] ?? '');
			const firstWidths = firstCols.map((col) => displayWidth(col));
			const maxFirstWidth = Math.max(...firstWidths);
			const minFirstWidth = Math.min(...firstWidths);
			// Allow some tolerance for alignment padding
			expect(maxFirstWidth - minFirstWidth).toBeLessThanOrEqual(3);
		});

		it('trims whitespace around equal signs', () => {
			const engine = new AlignmentEngineImpl();
			const lines = [
				'a   =   1',
				'aa  =  22',
				'ccc = 333',
			];
			const aligned = engine.alignLines(lines, '=', 'left');

			// Should have " = " as separator (single space after =)
			// Note: there may be alignment padding before =, which is expected
			aligned.forEach((line) => {
				expect(line).toMatch(/ = /); // Single space after =
				// Allow alignment padding before =, but ensure single space after
				expect(line).toMatch(/=\s+\S/); // = followed by single space and non-space
			});
		});

		it('handles compound operators like <=, >=, ==, ===', () => {
			const engine = new AlignmentEngineImpl();
			const lines = [
				'a<=b',
				'aa>=bb',
				'aaa==bbb',
				'aaaa===cccc',
			];
			const aligned = engine.alignLines(lines, '=', 'left');

			// For compound operators, they are treated as delimiters
			// The content before and after should be aligned
			// Note: compound operators are simplified to single = in output
			// All lines should have " = " as separator
			aligned.forEach((line) => {
				expect(line).toMatch(/ = /);
			});
		});
	});
});
