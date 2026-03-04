import type { FileExportEvent } from "../events";
import type { Exporter } from "../exporter";

const _BASE_URL = "https://cloud-api.yandex.net/v1/disk/resources";

const _yandexExportFunction = (_event: FileExportEvent) => {
	console.log("event emitted");
};

export const YandexExporter: Exporter = {
	fn: (event) => console.log(`Exporter: ${event}`),
	name: "yandex-exporter",
};
