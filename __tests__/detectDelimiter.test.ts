import { detectDelimiter, COMMON_ALIGNMENT_DELIMITERS } from "../src/utils/detectDelimiter";

describe("detectDelimiter", () => {
	it("prioritizes delimiters present across multiple rows", () => {
		const lines = ["a=1", "aa=22", "ccc=333"];
		const detected = detectDelimiter(lines);
		expect(detected).toBe("=");
	});

	it("prefers more consistent column counts", () => {
		const lines = ["a:1:foo", "bb:2:bar", "c:3"];
		const detected = detectDelimiter(lines);
		// colon present in all lines with mostly 3 columns but one shorter - still better than "=" occurring once
		expect(detected).toBe(":");
	});

	it("returns undefined when no delimiter meets minimum rows", () => {
		const lines = ["only one line"];
		const detected = detectDelimiter(lines);
		expect(detected).toBeUndefined();
	});

	it("allows overriding candidate list", () => {
		const lines = ["alpha|beta", "gamma|delta"];
		const detected = detectDelimiter(lines, { candidates: ["|"] });
		expect(detected).toBe("|");
	});

	it("skips delimiters with insufficient rows even if variance is low", () => {
		const lines = ["x+y", "x+y"];
		const detected = detectDelimiter(lines, { minMatches: 3 });
		expect(detected).toBeUndefined();
	});
});
