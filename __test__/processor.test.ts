import { describe, expect, it } from "bun:test";
import type { FileExportEvent } from "../src/events";
import { Processor } from "../src/processor";
import { AsyncQueue } from "../src/queue";

function createEvent(id: string): FileExportEvent {
	return {
		id,
		createdAt: Date.now(),
		deleteOnProcessEnd: false,
		event: "rename",
		exporter: null,
		exporters: ["yandex-exporter"],
		filename: `${id}.txt`,
		path: "/tmp",
		watcherName: "watcher",
	};
}

async function stopProcessor(
	queue: AsyncQueue<FileExportEvent>,
	processingPromise: Promise<void>
) {
	queue.close();
	await processingPromise.catch(() => undefined);
}

function waitWithTimeout<T>(promise: Promise<T>, timeoutMs: number) {
	return Promise.race([
		promise,
		Bun.sleep(timeoutMs).then(() => {
			throw new Error(`timed out after ${timeoutMs}ms`);
		}),
	]) as Promise<T>;
}

describe("Processor", () => {
	it("flushes when batch reaches configured size", async () => {
		const inputQueue = new AsyncQueue<FileExportEvent>();
		const processor = new Processor({
			batchSize: 2,
			batchTimeout: 1000,
		});
		const processingPromise = processor.process(inputQueue);

		const first = createEvent("1");
		const second = createEvent("2");
		inputQueue.push(first);
		inputQueue.push(second);

		const batch = await waitWithTimeout(processor.batchQueue.shift(), 300);
		expect(batch.events).toEqual([first, second]);
		expect(batch.id.length).toBeGreaterThan(0);

		await stopProcessor(inputQueue, processingPromise);
	});

	it("flushes by timeout when batch is not full", async () => {
		const inputQueue = new AsyncQueue<FileExportEvent>();
		const processor = new Processor({
			batchSize: 10,
			batchTimeout: 20,
		});
		const processingPromise = processor.process(inputQueue);

		const event = createEvent("single");
		inputQueue.push(event);

		const batch = await waitWithTimeout(processor.batchQueue.shift(), 500);
		expect(batch.events).toEqual([event]);

		await stopProcessor(inputQueue, processingPromise);
	});
});
