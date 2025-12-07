import type { Pipeline } from './Pipeline';
import type { ProcessingStage } from './ProcessingStage';
import { AlignmentContext } from '../alignment/AlignmentContext';

/**
 * Implementation of the pipeline pattern
 */
export class PipelineImpl<TInput, TOutput> implements Pipeline<TInput, TOutput> {
	private readonly stages: ProcessingStage<unknown, unknown>[] = [];
	private readonly stageNames: string[] = [];

	constructor(stages: ProcessingStage<unknown, unknown>[] = []) {
		this.stages = [...stages];
		this.stageNames = stages.map(s => s.getName());
	}

	execute(input: TInput, context: AlignmentContext): TOutput {
		let current: unknown = input;

		for (const stage of this.stages) {
			current = stage.process(current, context);
		}

		return current as TOutput;
	}

	addStage<TOut>(stage: ProcessingStage<TOutput, TOut>): Pipeline<TInput, TOut> {
		const newStages = [...this.stages, stage];
		return new PipelineImpl<TInput, TOut>(newStages as ProcessingStage<unknown, unknown>[]);
	}

	getStageNames(): string[] {
		return [...this.stageNames];
	}
}
