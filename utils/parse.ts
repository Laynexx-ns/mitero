export function parseAt(at: string | undefined): number | null {
	if (at === undefined) {
		return null;
	}

	const n = Number.parseInt(at, 10);
	return Number.isNaN(n) ? null : n;
}
