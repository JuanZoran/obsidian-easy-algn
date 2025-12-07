import type { AlignmentEngine } from './AlignmentEngine';
import type { AlignmentOptions, JustifyModeOrArray } from '../../easyAlign/types';
import { AlignmentContext } from './AlignmentContext';
import { PipelineBuilder } from '../pipeline/PipelineBuilder';
import type { Pipeline } from '../pipeline/Pipeline';

/**
 * Implementation of the alignment engine using strategy and pipeline patterns
 */
export class AlignmentEngineImpl implements AlignmentEngine {
	private readonly pipeline: Pipeline<string[], string[]>;

	constructor(pipeline?: Pipeline<string[], string[]>) {
		this.pipeline = pipeline ?? PipelineBuilder.createStandardPipeline();
	}

	alignLines(
		lines: string[],
		delimiter: string,
		justify: JustifyModeOrArray,
		options?: AlignmentOptions,
	): string[] {
		if (!lines.length || delimiter === '') {
			return [...lines];
		}

		// Create alignment context
		const context = new AlignmentContext(
			delimiter,
			typeof justify === 'string' ? justify : justify,
			options ?? {},
		);

		// Execute pipeline
		const result = this.pipeline.execute(lines, context);
		return result;
	}
}
