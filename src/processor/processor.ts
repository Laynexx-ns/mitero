import { ulid } from "ulid";
import type { FileExportEvent } from "../events";
import { AsyncQueue } from "../queue";
import { PROCESSOR_ERRORS } from "./errors";

export interface FileEventBatch {
	events: FileExportEvent[];
	id: string;
}
export interface ProcessorConfig {
	batchSize: number;

	/**
	 * batchTimeout - time to collect events into one batch before flushing batch into batch queue
	 */
	batchTimeout: number;
}

export class Processor {
	readonly batchQueue: AsyncQueue<FileEventBatch>;

	protected _processing = false;
	protected config: ProcessorConfig;
	protected timeout: Timer | null = null;
	protected currentBatch: FileEventBatch | null = null;

	get processing(): boolean {
		return this._processing;
	}

	constructor(config: ProcessorConfig) {
		this.config = config;
		this.batchQueue = new AsyncQueue();
	}

	async process(queue: AsyncQueue<FileExportEvent>) {
		if (this._processing) {
			throw new Error(PROCESSOR_ERRORS.ALREADY_PROCESSING);
		}
		this._processing = true;

		try {
			while (this._processing) {
				const event = await queue.shift();

				if (this.currentBatch === null) {
					this.currentBatch = {
						id: ulid(),
						events: [event],
					};
					this.setFlushTimeout();
				} else {
					this.push(event);
				}

				if (this.isCurrentBatchFullfilled()) {
					this.flush();
				}
			}
		} finally {
			this.stop();
		}
	}

	stop() {
		if (!this._processing) {
			throw new Error(PROCESSOR_ERRORS.NOT_ACTIVE_PROCESSING);
		}
		this._processing = false;
		if (this.currentBatch) {
			this.flush();
		} else if (this.timeout) {
			clearInterval(this.timeout);
		}
		this.timeout = null;
		this.currentBatch = null;
	}

	protected isCurrentBatchFullfilled(): boolean {
		return this.currentBatch?.events.length === this.config.batchSize;
	}

	protected push(v: FileExportEvent): void {
		if (this.currentBatch?.events) {
			this.currentBatch.events.push(v);
		}
	}

	protected flush(): void {
		if (this.currentBatch) {
			this.batchQueue.push(this.currentBatch);
		}
		this.currentBatch = null;
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	protected setFlushTimeout(): void {
		this.timeout = setTimeout(() => {
			this.flush();
		}, this.config.batchTimeout);
	}
}
