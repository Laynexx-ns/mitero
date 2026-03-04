import { describe, expect, it, spyOn } from "bun:test";
import { runInBackground } from "../src/background";

describe("runInBackground", () => {
	it("logs errors from rejected promises", async () => {
		const errorSpy = spyOn(console, "error").mockImplementation(
			() => undefined
		);

		try {
			runInBackground(Promise.reject(new Error("boom")));
			await Bun.sleep(5);
			expect(errorSpy).toHaveBeenCalledTimes(1);
			expect(errorSpy.mock.calls[0]?.[0]).toBeInstanceOf(Error);
		} finally {
			errorSpy.mockRestore();
		}
	});
});
