/**
 * Options for creating glue between cells
 */
export interface GlueOptions {
	addSpaces?: boolean;
	useFullwidthSpaces?: boolean;
	delimiter: string;
}

/**
 * Strategy for handling delimiter-based splitting and joining
 */
export interface DelimiterStrategy {
	/**
	 * Check if this strategy can handle the given delimiter
	 */
	canHandle(delimiter: string): boolean;

	/**
	 * Split a line into parts using this delimiter strategy
	 */
	split(line: string): string[];

	/**
	 * Create the glue string to join cells with
	 */
	createGlue(options: GlueOptions): string;
}
