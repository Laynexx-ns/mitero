import { type WatchEventType, watch } from "node:fs";
import { ulid } from "ulid";
import type { FileExportEvent } from "../events";
import { WATCHER_ERRORS } from "./errors";

export interface WatcherConfig {
	deleteOnProcessEnd: boolean;
	exporters: string[];
	listen: WatchEventType[];
	processExisting: boolean;
	recursive: boolean;
	tag?: string;
	watchPath: string;
}

export interface WatcherProps {
	config: WatcherConfig;
	name: string;
}

export type WatcherFlushFunction = (fileExportEvent: FileExportEvent) => void;

export interface Watcher {
	config: WatcherConfig;
	stop: () => void;
	watch: () => void;
	watcher: ReturnType<typeof watch> | null;
}
export class FileWatcher implements Watcher {
	config: WatcherConfig;
	watcher: ReturnType<typeof watch> | null = null;
	name: string;
	flush: WatcherFlushFunction;
	lastEvent: FileExportEvent | null = null;

	constructor(props: WatcherProps, flush: WatcherFlushFunction) {
		this.config = props.config;
		this.name = props.name;
		this.flush = flush;
	}

	watch() {
		this.watcher = watch(
			this.config.watchPath,
			{
				recursive: this.config.recursive,
			},
			(event, filename) => {
				const exporterEvent: FileExportEvent = {
					id: ulid(),
					exporters: this.config.exporters,
					createdAt: Date.now(),
					event,
					deleteOnProcessEnd: this.config.deleteOnProcessEnd,
					exporter: null,
					filename,
					watcherName: this.name,
					tag: this.config.tag,
					path: this.config.watchPath,
				};

				this.lastEvent = exporterEvent;
				this.flush(exporterEvent);
			}
		);
	}

	stop() {
		if (!this.watcher) {
			throw new Error(WATCHER_ERRORS.WATCHER_NOT_EXISTS);
		}
		this.watcher.close();
	}
}
