import { previewAlignment } from "../src/easyAlign/preview";

describe("previewAlignment", () => {
	it("aligns the provided lines and returns a multiline string", () => {
		const lines = ["a=1", "aa=22"];
		const result = previewAlignment(lines, "=", "left");

		expect(result.split("\n")).toHaveLength(2);
		expect(result).toContain(" = ");
	});

	it("limits preview to the requested number of lines", () => {
		const lines = ["a=1", "aa=22", "ccc=333"];
		const result = previewAlignment(lines, "=", "left", 2);

		expect(result.split("\n")).toHaveLength(2);
	});
});
