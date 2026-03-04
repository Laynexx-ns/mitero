// TODO: change to normal logging
export function runInBackground(p: Promise<unknown>): void {
	p.catch((e) => {
		console.error(e);
	});
}
