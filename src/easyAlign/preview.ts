import { AlignmentEngineImpl } from "./engine";
import type { AlignmentSettingsData, JustifyModeOrArray } from "./types";

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
