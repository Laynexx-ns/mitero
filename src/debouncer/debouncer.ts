export class Debouncer<KeyType, T> {
	protected events: Map<KeyType, T> = new Map();
	protected keysOrder: KeyType[] = [];

	push(key: KeyType, event: T): void {
		if (!this.events.has(key)) {
			this.keysOrder.push(key);
		}

		this.events.set(key, event);
	}

	flush(): T[] {
		const mappedArray: T[] = this.keysOrder
			.map((key) => this.events.get(key))
			.filter((item) => item !== undefined);
		this.reset();

		return mappedArray;
	}

	flushMap(): Map<KeyType, T> {
		const map = this.events;
		this.reset();

		return map;
	}

	protected reset() {
		this.events.clear();
		this.keysOrder = [];
	}
}
