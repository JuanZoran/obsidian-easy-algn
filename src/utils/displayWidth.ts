export const isFullwidthCodePoint = (codePoint: number): boolean => {
	if (Number.isNaN(codePoint)) {
		return false;
	}

	if (
		codePoint >= 0x1100 &&
		(
			codePoint <= 0x115f ||
			codePoint === 0x2329 ||
			codePoint === 0x232a ||
			(codePoint >= 0x2e80 && codePoint <= 0x3247 && codePoint !== 0x303f) ||
			(codePoint >= 0x3250 && codePoint <= 0x4dbf) ||
			(codePoint >= 0x4e00 && codePoint <= 0xa4c6) ||
			(codePoint >= 0xa960 && codePoint <= 0xa97c) ||
			(codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
			(codePoint >= 0xf900 && codePoint <= 0xfaff) ||
			(codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
			(codePoint >= 0xfe30 && codePoint <= 0xfe6b) ||
			(codePoint >= 0xff01 && codePoint <= 0xff60) ||
			(codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
			(codePoint >= 0x1b000 && codePoint <= 0x1b001) ||
			(codePoint >= 0x1f200 && codePoint <= 0x1f251) ||
			(codePoint >= 0x20000 && codePoint <= 0x3fffd)
		)
	) {
		return true;
	}

	return false;
};

const isCombiningCharacter = (codePoint: number) => codePoint >= 0x300 && codePoint <= 0x36f;

export const displayWidth = (value: string): number => {
	let width = 0;

	for (let index = 0; index < value.length; index += 1) {
		const codePoint = value.codePointAt(index);
		if (codePoint === undefined) {
			continue;
		}

		if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
			continue;
		}

		if (isCombiningCharacter(codePoint)) {
			continue;
		}

		if (codePoint > 0xffff) {
			index += 1;
		}

		width += isFullwidthCodePoint(codePoint) ? 2 : 1;
	}

	return width;
};
