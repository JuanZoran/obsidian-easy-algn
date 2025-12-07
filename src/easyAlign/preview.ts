import { AlignmentEngineImpl } from "../core/alignment/AlignmentEngineImpl";
import type { JustifyModeOrArray } from "./types";

/**
 * @internal
 * Preview alignment function used for testing purposes only.
 */
export function previewAlignment(
	lines: string[],
	delimiter: string,
	justify: JustifyModeOrArray,
	maxLines = 3,
): string {
	if (!lines.length) {
		return "";
	}

	const engine = new AlignmentEngineImpl();
	const subset = lines.slice(0, maxLines);
	return engine.alignLines(subset, delimiter, justify).join("\n");
}
