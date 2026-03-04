import { describe, expect, it } from "bun:test";
import { ASYNC_QUEUE_ERRORS, AsyncQueue } from "../src/queue";

describe("AsyncQueue", () => {
	it("returns items in FIFO order", async () => {
		const queue = new AsyncQueue<number>();

		queue.push(1);
		queue.push(2);

		expect(await queue.shift()).toBe(1);
		expect(await queue.shift()).toBe(2);
	});

	it("resolves a pending shift after push", async () => {
		const queue = new AsyncQueue<string>();

		const pending = queue.shift();
		queue.push("ready");

		await expect(pending).resolves.toBe("ready");
	});

	it("tracks hasItems state", async () => {
		const queue = new AsyncQueue<string>();

		expect(queue.hasItems).toBe(false);

		queue.push("item");
		expect(queue.hasItems).toBe(true);

		await queue.shift();
		expect(queue.hasItems).toBe(false);
	});

	it("throws if queue is closed", () => {
		const queue = new AsyncQueue<number>();
		queue.close();

		expect(() => queue.push(1)).toThrow(ASYNC_QUEUE_ERRORS.QUEUE_IS_CLOSED);
		expect(() => queue.shift()).toThrow(ASYNC_QUEUE_ERRORS.QUEUE_IS_CLOSED);
	});

	it("rejects pending waiters on close", async () => {
		const queue = new AsyncQueue<number>();
		const pending = queue.shift();

		queue.close();

		await expect(pending).rejects.toBe(ASYNC_QUEUE_ERRORS.QUEUE_IS_CLOSED);
	});
});
