import type { Pipeline } from './Pipeline';
import { PipelineImpl } from './PipelineImpl';
import { SplitStage } from './stages/SplitStage';
import { PreprocessStage } from './stages/PreprocessStage';
import { FilterStage } from './stages/FilterStage';
import { MeasureStage } from './stages/MeasureStage';
import { JustifyStage } from './stages/JustifyStage';
import { JoinStage } from './stages/JoinStage';

/**
 * Builder for creating alignment pipelines
 */
export class PipelineBuilder {
	/**
	 * Create a standard alignment pipeline with all stages
	 */
	static createStandardPipeline(): Pipeline<string[], string[]> {
		return new PipelineImpl<string[], string[]>([])
			.addStage(new SplitStage())
			.addStage(new PreprocessStage())
			.addStage(new FilterStage())
			.addStage(new MeasureStage())
			.addStage(new JustifyStage())
			.addStage(new JoinStage());
	}

	/**
	 * Create a custom pipeline starting from scratch
	 */
	static create(): PipelineBuilder {
		return new PipelineBuilder();
	}

	private stages: unknown[] = [];

	/**
	 * Add a custom stage to the pipeline
	 */
	addStage<TInput, TOutput>(stage: unknown): PipelineBuilder {
		this.stages.push(stage);
		return this;
	}

	/**
	 * Build the pipeline
	 */
	build<TInput, TOutput>(): Pipeline<TInput, TOutput> {
		return new PipelineImpl<TInput, TOutput>(this.stages as any);
	}
}
