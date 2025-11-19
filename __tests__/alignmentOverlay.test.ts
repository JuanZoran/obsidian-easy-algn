import { AlignmentOverlay } from "../src/easyAlign/overlay";
import { AlignmentCustomizationControllerImpl } from "../src/easyAlign/interaction";

describe("AlignmentOverlay", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("focuses delimiter input, updates preview, and confirms on Enter", async () => {
		const lines = ["a=1", "aa=22"];
		const controller = new AlignmentCustomizationControllerImpl();
		const previewSpy = jest.fn();
		const confirmSpy = jest.fn();
		const cancelSpy = jest.fn();
		const overlay = new AlignmentOverlay(lines, controller, previewSpy, confirmSpy, cancelSpy);

		overlay.open();

		const delimiterInput = document.body.querySelector<HTMLInputElement>('input[name="delimiter"]');
		expect(delimiterInput).toBeTruthy();
		expect(document.activeElement).toBe(delimiterInput);

		expect(previewSpy).toHaveBeenCalledTimes(1);

		delimiterInput!.value = " | ";
		delimiterInput!.dispatchEvent(new Event("input", { bubbles: true }));

		const justifySelect = document.body.querySelector<HTMLSelectElement>('select[name="justify"]');
		justifySelect!.value = "right";
		justifySelect!.dispatchEvent(new Event("change", { bubbles: true }));

		expect(previewSpy).toHaveBeenCalledTimes(3);

		delimiterInput!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

		await Promise.resolve();

		expect(confirmSpy).toHaveBeenCalledWith({
			delimiter: "|",
			justify: "right",
		});
		expect(cancelSpy).not.toHaveBeenCalled();
	});

	it("cancels via Escape and removes overlay", () => {
		const lines = ["a=1"];
		const controller = new AlignmentCustomizationControllerImpl();
		const previewSpy = jest.fn();
		const confirmSpy = jest.fn();
		const cancelSpy = jest.fn();
		const overlay = new AlignmentOverlay(lines, controller, previewSpy, confirmSpy, cancelSpy);

		overlay.open();

		const container = document.body.querySelector(".align-overlay");
		expect(container).toBeTruthy();

		container!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

		expect(cancelSpy).toHaveBeenCalled();
		expect(document.body.querySelector(".align-overlay")).toBeNull();
		expect(confirmSpy).not.toHaveBeenCalled();
	});
});
