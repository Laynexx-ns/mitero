import type { FileExportEvent } from "../events";
import type { Exporter } from "../exporter";
import type { FileEventBatch } from "../processor";
import type { AsyncQueue } from "../queue";

export interface EventWorkerConfig {
	exporters: Exporter[];
	workerId: number;
}

export class EventWorker {
	protected config: EventWorkerConfig;
	protected listening = false;

	constructor(config: EventWorkerConfig) {
		this.config = config;
	}

	async listenQueue(queue: AsyncQueue<FileEventBatch>) {
		for await (const batch of queue) {
			for (const event of batch.events) {
				this.processEvent(event);
			}
		}
	}

	processEvent(event: FileExportEvent) {
		console.log(
			`worker ${this.config.workerId} started processing: ${event.id}`
		);
		const availableExpoters = this.config.exporters.filter((item) =>
			event.exporters.includes(item.name)
		);
		for (const exporter of availableExpoters) {
			console.log(
				`worker ${this.config.workerId} exporting: ${event.id} using ${exporter.name} exporter`
			);
			exporter.fn(event);
		}
	}
}
