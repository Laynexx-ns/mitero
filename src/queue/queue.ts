import { ASYNC_QUEUE_ERRORS } from "./errors";

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
		const waiting = this.waitings.shift();
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

		const item = this.items.shift() as T | undefined;
		if (item !== undefined && item !== null) {
			return new Promise((resolve) => resolve(item));
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
