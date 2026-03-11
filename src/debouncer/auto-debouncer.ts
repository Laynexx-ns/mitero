import { Debouncer } from "./debouncer";

export interface AutoDebouncerConfig<T> {
	interval: number;
	pushSource: AutoDebouncerPushSource<T>;
}
export interface AutoDebouncerPushSource<T> {
	push: (item: T) => void;
}

export class AutoDebouncer<KeyType, T> extends Debouncer<KeyType, T> {
	protected interval: number;
	protected pushSource: AutoDebouncerPushSource<T>;
	protected flushInterval: ReturnType<typeof setInterval> | null = null;

	constructor(config: AutoDebouncerConfig<T>) {
		super();
		this.interval = config.interval;
		this.pushSource = config.pushSource;
	}

	debounce(): void {
		console.log(this.interval);
		if (this.flushInterval) {
			return;
		}
		this.flushInterval = setInterval(() => {
			this.send();
		}, this.interval);
	}

	stop(): void {
		if (this.flushInterval) {
			clearInterval(this.flushInterval);
			this.flushInterval = null;
		}
	}

	protected send(): void {
		const items = this.flush();
		console.log("items: ", items);
		items.forEach((item) => {
			this.pushSource.push(item);
		});
	}
}
