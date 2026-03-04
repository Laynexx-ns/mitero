import type { FileExportEvent } from "../events";

export type ExporterFn = (event: FileExportEvent) => void;
export interface Exporter {
	fn: ExporterFn;
	name: string;
}
