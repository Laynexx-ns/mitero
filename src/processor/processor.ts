import { ulid } from "ulid";
import type { FileExportEvent } from "../events";
import { AsyncQueue } from "../queue";

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
	protected config: ProcessorConfig;

	timeout: Timer | null = null;
	currentBatch: FileEventBatch | null = null;

	constructor(config: ProcessorConfig) {
		this.config = config;
		this.batchQueue = new AsyncQueue();
	}

	async process(queue: AsyncQueue<FileExportEvent>) {
		while (true) {
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
			console.log("timeout emitted");
		}, this.config.batchTimeout);
	}
}
