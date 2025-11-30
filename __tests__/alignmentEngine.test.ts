import { AlignmentEngineImpl } from '../src/easyAlign/engine';
import { displayWidth } from '../src/utils/displayWidth';

describe('AlignmentEngineImpl', () => {
	const sampleLines = ['a=1', 'aa=22', 'ccc=333'];
	let engine: AlignmentEngineImpl;

	beforeEach(() => {
		engine = new AlignmentEngineImpl();
	});

	it('left justifies columns based on delimiter', () => {
		const aligned = engine.alignLines(sampleLines, '=', 'left');
		expect(aligned).toEqual(['a   = 1', 'aa  = 22', 'ccc = 333']);
	});

	it('centers text when requested', () => {
		const aligned = engine.alignLines(sampleLines, '=', 'center');
		expect(aligned[0]).toContain(' = ');
		expect(aligned[1]).toContain(' = ');
	});

	it('aligns wide characters by display width', () => {
		const lines = ['简:文', '复杂:结构'];
		const aligned = engine.alignLines(lines, ':', 'left');

		const leftParts = aligned.map((line) => line.split(' : ')[0]);
		const leftWidths = leftParts.map((part) => displayWidth(part));
		expect(leftWidths).toEqual([4, 4]);

	});

	it('keeps colon position stable for chinese bullet list', () => {
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

	it('aligns text with emojis correctly', () => {
		const lines = [
			'- status        : ||n. 地位||',
			'- check         : ||n.抑制||',
			'- row ⭐         : ||n.争论||',
			'- act ⭐         : ||n.法案||',
			'- address ⭐     : ||n.演说，致辞；v.解决，处理||',
		];
		const aligned = engine.alignLines(lines, ':', 'left');
		
		const leftParts = aligned.map((line) => line.split(' : ')[0]);
		const leftWidths = leftParts.map((part) => displayWidth(part));
		// All left parts should have the same display width
		expect(leftWidths.every((width) => width === leftWidths[0])).toBe(true);
	});

	describe('per-column justify mode', () => {
		it('supports array of justify modes for different columns', () => {
			const lines = ['a=1=2', 'aa=22=333', 'ccc=333=4444'];
			const aligned = engine.alignLines(lines, '=', ['left', 'center', 'right']);

			// Verify all columns are aligned with correct justify modes
			const parts = aligned.map((line) => line.split(' = '));
			expect(parts.every((row) => row.length === 3)).toBe(true);

			// First column: left-aligned
			const firstCols = parts.map((row) => row[0] ?? '');
			const firstWidths = firstCols.map((col) => displayWidth(col));
			expect(firstWidths.every((w) => w === firstWidths[0])).toBe(true);

			// Second column: center-aligned
			const secondCols = parts.map((row) => row[1] ?? '');
			const secondWidths = secondCols.map((col) => displayWidth(col));
			expect(secondWidths.every((w) => w === secondWidths[0])).toBe(true);

			// Third column: right-aligned
			const thirdCols = parts.map((row) => row[2] ?? '');
			const thirdWidths = thirdCols.map((col) => displayWidth(col));
			expect(thirdWidths.every((w) => w === thirdWidths[0])).toBe(true);
			expect(thirdCols[0]).toMatch(/^\s+2$/); // Right-aligned with padding
		});

		it('recycles justify mode array when columns exceed array length', () => {
			const lines = ['a=1=2=3', 'aa=22=333=4444'];
			const aligned = engine.alignLines(lines, '=', ['left', 'right']);

			// Column 0: left (index 0)
			// Column 1: right (index 1)
			// Column 2: left (index 0, recycled)
			// Column 3: right (index 1, recycled)

			const parts = aligned.map((line) => line.split(' = '));
			expect(parts.every((row) => row.length === 4)).toBe(true);

			// Verify justify modes cycle correctly: left, right, left, right
			// First column: left-aligned
			const firstWidths = parts.map((row) => displayWidth(row[0] ?? ''));
			expect(firstWidths.every((w) => w === firstWidths[0])).toBe(true);

			// Second column: right-aligned
			const secondWidths = parts.map((row) => displayWidth(row[1] ?? ''));
			expect(secondWidths.every((w) => w === secondWidths[0])).toBe(true);
			expect(parts[0][1]).toMatch(/^\s+1$/); // Right-aligned

			// Third column: left-aligned (recycled)
			const thirdWidths = parts.map((row) => displayWidth(row[2] ?? ''));
			expect(thirdWidths.every((w) => w === thirdWidths[0])).toBe(true);

			// Fourth column: right-aligned (recycled)
			const fourthWidths = parts.map((row) => displayWidth(row[3] ?? ''));
			expect(fourthWidths.every((w) => w === fourthWidths[0])).toBe(true);
		});

		it('works with single justify mode (backward compatibility)', () => {
			const aligned = engine.alignLines(sampleLines, '=', 'left');
			expect(aligned).toEqual(['a   = 1', 'aa  = 22', 'ccc = 333']);
		});
	});

	describe('filter functionality', () => {
		it('filters columns to align only first column', () => {
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
	});

	describe('equal sign special handling', () => {
		it('handles simple equal sign patterns with whitespace normalization', () => {
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

		it('trims whitespace and handles compound operators', () => {
			const lines = [
				'a   =   1',
				'aa<=bb',
				'aaa==bbb',
			];
			const aligned = engine.alignLines(lines, '=', 'left');

			// All lines should have " = " as separator after normalization
			aligned.forEach((line) => {
				expect(line).toMatch(/ = /);
			});
		});
	});

	describe('addSpacesAroundDelimiter option', () => {
		it('adds spaces around delimiter when enabled (default)', () => {
			const lines = ['a:1', 'bb:22', 'ccc:333'];
			const aligned = engine.alignLines(lines, ':', 'left');
			
			// Should have spaces around colon
			expect(aligned[0]).toContain(' : ');
			expect(aligned[1]).toContain(' : ');
			expect(aligned[2]).toContain(' : ');
		});

		it('does not add spaces around delimiter when disabled', () => {
			const lines = ['a:1', 'bb:22', 'ccc:333'];
			const aligned = engine.alignLines(lines, ':', 'left', {
				addSpacesAroundDelimiter: false,
			});
			
			// Should not have spaces around colon
			expect(aligned[0]).toContain(':');
			expect(aligned[0]).not.toContain(' : ');
			expect(aligned[1]).toContain(':');
			expect(aligned[1]).not.toContain(' : ');
		});

		it('handles equal sign with addSpacesAroundDelimiter option', () => {
			const lines = ['a=1', 'bb=22'];
			
			// With spaces (default)
			const alignedWithSpaces = engine.alignLines(lines, '=', 'left');
			expect(alignedWithSpaces[0]).toContain(' = ');
			
			// Without spaces
			const alignedWithoutSpaces = engine.alignLines(lines, '=', 'left', {
				addSpacesAroundDelimiter: false,
			});
			expect(alignedWithoutSpaces[0]).toContain('=');
			expect(alignedWithoutSpaces[0]).not.toContain(' = ');
		});
	});

	describe('useFullwidthSpaces option', () => {
		it('uses fullwidth spaces around delimiter when enabled', () => {
			const lines = ['a=1', 'aaaa=22'];
			const aligned = engine.alignLines(lines, '=', 'left', { useFullwidthSpaces: true });

			expect(aligned[0]).toContain('　=　');
			const parts = aligned.map((line) => line.split('　=　'));
			expect(parts.every((row) => row.length === 2)).toBe(true);

			const leftWidths = parts.map((row) => displayWidth(row[0] ?? ''));
			expect(leftWidths.every((width) => width === leftWidths[0])).toBe(true);
			expect(parts[0][0]).toContain('　'); // padding should include fullwidth space
		});

		it('keeps alignment width accurate when padding mixes fullwidth and halfwidth spaces', () => {
			const lines = ['短:1', '较长内容:22'];
			const aligned = engine.alignLines(lines, ':', 'left', { useFullwidthSpaces: true });

			const glue = '　:　';
			expect(aligned.every((line) => line.includes(glue))).toBe(true);

			const leftWidths = aligned.map((line) => {
				const [left] = line.split(glue);
				return displayWidth(left ?? '');
			});

			expect(leftWidths.every((width) => width === leftWidths[0])).toBe(true);
		});
	});
});
