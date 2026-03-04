import path from "node:path";
import ymlConfig from "../../config.yml";
import type { WatcherConfig } from "../watcher";
import { assertConfigIsValid } from "./validation";

export type WatcherName = string;
export type WatcherConfigs = Record<WatcherName, WatcherConfig>;
export interface MiteroConfig {
	batchSize: number;
	batchTimeout: number;
	watchers: WatcherConfigs;
	workers: number;
}

export const loadConfig = (): MiteroConfig => {
	const loadedConfig = Bun.YAML.parse(ymlConfig) as unknown;
	assertConfigIsValid(loadedConfig);

	return normalizePathes(loadedConfig);
};

const normalizePathes = (cfg: MiteroConfig): MiteroConfig => {
	for (const v in cfg.watchers) {
		if (Object.hasOwn(cfg.watchers, v)) {
			const watcher = cfg.watchers[v];
			if (!watcher) {
				continue;
			}
			watcher.watchPath = path.resolve(watcher.watchPath);
		}
	}

	return cfg;
};
