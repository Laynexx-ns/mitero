export const ASYNC_QUEUE_ERRORS = {
	QUEUE_IS_CLOSED: "queue is closed",
	NO_ITEMS: "no items in queue",
	NO_ITEMS_TO_MODIFY: "no items in queue to modify",
} as const;
export type QueueError =
	(typeof ASYNC_QUEUE_ERRORS)[keyof typeof ASYNC_QUEUE_ERRORS];

export interface Waiting<T> {
	reject: (e: unknown) => void;
	resolve: (item: T) => void;
}
export type ArrayElementType<T extends readonly unknown[]> = T[number];

export class AsyncQueue<T> {
	protected items: T[] = [];
	protected waitings: Waiting<T>[] = [];
	protected closed = false;

	// this allows reading this queue
	async *[Symbol.asyncIterator](): AsyncGenerator<T> {
		while (true) {
			yield await this.shift();
		}
	}

	push(el: T): void {
		if (this.closed) {
			throw new Error(ASYNC_QUEUE_ERRORS.QUEUE_IS_CLOSED);
		}
		const waiting = this.waitings.shift() as Waiting<T>;
		if (!waiting) {
			this.items.push(el);
			return;
		}
		waiting.resolve(el);
	}

	get hasItems(): boolean {
		return this.items.length > 0;
	}

	shift(): Promise<T> {
		if (this.closed) {
			throw new Error(ASYNC_QUEUE_ERRORS.QUEUE_IS_CLOSED);
		}

		const item = this.items.shift();
		if (item !== undefined) {
			return item;
		}
		return new Promise<T>((resolve, reject) =>
			this.waitings.push({ resolve, reject })
		);
	}

	close(): void {
		this.closed = true;
		while (this.waitings.length) {
			this.waitings.shift()?.reject(ASYNC_QUEUE_ERRORS.QUEUE_IS_CLOSED);
		}
	}
}
