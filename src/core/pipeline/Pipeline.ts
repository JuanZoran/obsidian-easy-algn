import { ProcessingStage } from './ProcessingStage';
import { AlignmentContext } from '../alignment/AlignmentContext';

/**
 * A pipeline that processes data through multiple stages
 */
export interface Pipeline<TInput, TOutput> {
	/**
	 * Execute the pipeline with the given input
	 */
	execute(input: TInput, context: AlignmentContext): TOutput;

	/**
	 * Add a stage to the pipeline
	 * Returns a new pipeline with the stage added
	 */
	addStage<TOut>(stage: ProcessingStage<TOutput, TOut>): Pipeline<TInput, TOut>;

	/**
	 * Get all stage names in order
	 */
	getStageNames(): string[];
}
