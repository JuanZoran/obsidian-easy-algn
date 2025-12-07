import { Row } from '../models/Row';
import type { AlignmentOptions } from '../../easyAlign/types';

/**
 * Context object passed through the alignment pipeline
 */
export class AlignmentContext {
	// Metadata map is mutable to allow stages to store and retrieve data
	public readonly metadata: Map<string, unknown>;

	constructor(
		public readonly delimiter: string,
		public readonly justify: string | string[],
		public readonly options: AlignmentOptions = {},
		metadata?: Map<string, unknown>,
	) {
		// Use provided metadata or create new mutable map
		this.metadata = metadata ?? new Map();
	}

	/**
	 * Get a metadata value
	 */
	getMetadata<T>(key: string): T | undefined {
		return this.metadata.get(key) as T | undefined;
	}

	/**
	 * Set a metadata value
	 */
	setMetadata(key: string, value: unknown): AlignmentContext {
		const newMetadata = new Map(this.metadata);
		newMetadata.set(key, value);
		return new AlignmentContext(
			this.delimiter,
			this.justify,
			this.options,
			newMetadata,
		);
	}

	/**
	 * Create a new context with updated options
	 */
	withOptions(newOptions: Partial<AlignmentOptions>): AlignmentContext {
		return new AlignmentContext(
			this.delimiter,
			this.justify,
			{ ...this.options, ...newOptions },
			this.metadata,
		);
	}
}
