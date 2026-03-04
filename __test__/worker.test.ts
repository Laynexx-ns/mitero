import { describe, expect, it, mock } from "bun:test";
import type { FileExportEvent } from "../src/events";
import type { FileEventBatch } from "../src/processor";
import { AsyncQueue } from "../src/queue";
import { EventWorker } from "../src/worker";

function createEvent(exporters: string[]): FileExportEvent {
	return {
		id: "evt-1",
		createdAt: Date.now(),
		deleteOnProcessEnd: false,
		event: "change",
		exporter: null,
		exporters,
		filename: "file.txt",
		path: "/tmp",
		watcherName: "watcher",
	};
}

describe("EventWorker", () => {
	it("runs only matching exporters", () => {
		const yandexFn = mock(() => undefined);
		const ignoredFn = mock(() => undefined);
		const worker = new EventWorker({
			exporters: [
				{ name: "yandex-exporter", fn: yandexFn },
				{ name: "ignored-exporter", fn: ignoredFn },
			],
		});

		worker.processEvent(createEvent(["yandex-exporter"]));

		expect(yandexFn).toHaveBeenCalledTimes(1);
		expect(ignoredFn).not.toHaveBeenCalled();
	});

	it("consumes batches from async queue", async () => {
		const exporterFn = mock(() => undefined);
		const worker = new EventWorker({
			exporters: [{ name: "yandex-exporter", fn: exporterFn }],
		});
		const queue = new AsyncQueue<FileEventBatch>();
		const listeningPromise = worker.listenQueue(queue);

		queue.push({
			id: "batch-1",
			events: [createEvent(["yandex-exporter"])],
		});

		await Bun.sleep(5);
		expect(exporterFn).toHaveBeenCalledTimes(1);

		queue.close();
		await listeningPromise.catch(() => undefined);
	});
});
