import { describe, expect, it } from "bun:test";
import path from "node:path";
import { assertConfigIsValid, loadConfig } from "../src/config";

function validConfig() {
	return {
		workers: 1,
		batchSize: 1,
		batchTimeout: 10,
		watchers: {
			main: {
				listen: ["change", "rename"],
				watchPath: "./",
				processExisting: false,
				recursive: false,
				exporters: ["yandex-exporter"],
				deleteOnProcessEnd: false,
			},
		},
	};
}

describe("config", () => {
	it("accepts a valid config shape", () => {
		expect(() => assertConfigIsValid(validConfig())).not.toThrow();
	});

	it("rejects workers below minimum", () => {
		const cfg = validConfig();
		cfg.workers = 0;

		expect(() => assertConfigIsValid(cfg)).toThrow();
	});

	it("rejects watchers with empty exporters", () => {
		const cfg = validConfig();
		cfg.watchers.main.exporters = [];

		expect(() => assertConfigIsValid(cfg)).toThrow();
	});

	it("normalizes loaded watcher paths to absolute paths", () => {
		const cfg = loadConfig();

		for (const watcher of Object.values(cfg.watchers)) {
			expect(path.isAbsolute(watcher.watchPath)).toBe(true);
		}
	});
});
