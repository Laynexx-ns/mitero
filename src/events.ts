import type { WatchEventType } from "node:fs";

export interface FileExportEvent {
	createdAt: number;
	deleteOnProcessEnd: boolean;
	event: WatchEventType;
	exporter: string | null;
	exporters: string[];
	filename: string | null;
	id: string;
	path: string;
	tag?: string;
	watcherName: string;
}
