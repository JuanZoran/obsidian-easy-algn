import { previewAlignment } from "../src/easyAlign/preview";

describe("previewAlignment", () => {
	it("aligns lines and limits preview to requested number", () => {
		const lines = ["a=1", "aa=22", "ccc=333"];
		const result = previewAlignment(lines, "=", "left", 2);

		expect(result.split("\n")).toHaveLength(2);
		expect(result).toContain(" = ");
	});
});
