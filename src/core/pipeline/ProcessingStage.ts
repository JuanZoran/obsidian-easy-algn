import { AlignmentContext } from '../alignment/AlignmentContext';

/**
 * A processing stage in the alignment pipeline
 */
export interface ProcessingStage<TInput, TOutput> {
	/**
	 * Process the input and return output
	 */
	process(input: TInput, context: AlignmentContext): TOutput;

	/**
	 * Get the stage name for logging/debugging
	 */
	getName(): string;
}
