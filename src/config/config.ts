import path from "node:path";
import ymlConfig from "../../config.yml";
import type { WatcherConfig } from "../watcher";
import { parseConfig } from "./validation";

export type WatcherName = string;
export type WatcherConfigs = Record<WatcherName, WatcherConfig>;
export interface MiteroConfig {
	batchSize: number;
	batchTimeout: number;
	bounceTimeout: number;
	watchers: WatcherConfigs;
	workers: number;
}

export const loadConfig = (): MiteroConfig => {
	const loadedConfig = Bun.YAML.parse(ymlConfig) as unknown;
	const config = parseConfig(loadedConfig) as MiteroConfig;

	return normalizePathes(config);
};

const normalizePathes = (cfg: MiteroConfig): MiteroConfig => {
	for (const v in cfg.watchers) {
		if (Object.hasOwn(cfg.watchers, v)) {
			const watcher = cfg.watchers[v];
			if (!watcher) {
				continue;
			}
			const base =
				process.env.WATCH_ROOT ??
				path.dirname(path.resolve(process.env.CONFIG_PATH ?? "config.yml"));

			watcher.watchPath = path.isAbsolute(watcher.watchPath)
				? watcher.watchPath
				: path.resolve(base, watcher.watchPath);
		}
	}

	return cfg;
};
