import { AlignmentOverlay } from "../src/plugins/ui/AlignmentOverlay";
import { AlignmentController } from "../src/plugins/ui/AlignmentController";

describe("AlignmentOverlay", () => {
	let lines: string[];
	let controller: AlignmentController;
	let previewSpy: jest.Mock;
	let confirmSpy: jest.Mock;
	let cancelSpy: jest.Mock;
	let overlay: AlignmentOverlay;

	beforeEach(() => {
		lines = ["a=1", "aa=22"];
		controller = new AlignmentController();
		previewSpy = jest.fn();
		confirmSpy = jest.fn();
		cancelSpy = jest.fn();
		overlay = new AlignmentOverlay(lines, controller, previewSpy, confirmSpy, cancelSpy);
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("focuses delimiter input, updates preview, and confirms on Enter", async () => {

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

		overlay.open();

		const container = document.body.querySelector(".align-overlay");
		expect(container).toBeTruthy();

		container!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

		expect(cancelSpy).toHaveBeenCalled();
		expect(document.body.querySelector(".align-overlay")).toBeNull();
		expect(confirmSpy).not.toHaveBeenCalled();
	});
});
