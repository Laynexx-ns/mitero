import type { FileExportEvent } from "../events";
import type { Exporter } from "../exporter";
import { buildFullFilePath, openFile } from "../file";

export interface YandexResp {
	href: string;
	method: string;
	templated: string;
}

export interface YandexPathResp extends YandexResp {
	operation_id: string;
}

const BASE_URL = "https://cloud-api.yandex.net/v1/disk/resources";

const yandexExportFunction = async (event: FileExportEvent) => {
	if (event.filename) {
		const file = openFile(buildFullFilePath(event.path, event.filename));

		console.log(await file.text());

		const TOKEN = process.env.YANDEX_API_TOKEN;
		if (!TOKEN) {
			throw new Error("env variable is null");
		}
		const UPLOAD_PATH = process.env.YANDEX_UPLOAD_PATH ?? "";

		const uploadURL = `${BASE_URL}?path=${UPLOAD_PATH}`;

		try {
			const resp = await Bun.fetch(uploadURL, {
				method: "PUT",
				headers: { Authorization: `OAuth ${TOKEN}` },
			});

			const fileURL = `${BASE_URL}/upload?path=${UPLOAD_PATH}/${event.filename}&overwrite=true`;
			const resp2 = await Bun.fetch(fileURL, {
				headers: { Authorization: `OAuth ${TOKEN}` },
			});

			const { href } = (await resp2.json()) as YandexPathResp;

			const { ok } = await Bun.fetch(href, {
				method: "PUT",
				body: file,
			});

			if (
				resp.status !== 409 &&
				(!ok || resp.status < 200 || resp.status > 300)
			) {
				throw new Error("failed to reserve a path");
			}
		} catch (e) {
			console.error(e);
		}
	}
};

export const YandexExporter: Exporter = {
	fn: yandexExportFunction,
	name: "yandex-exporter",
};
