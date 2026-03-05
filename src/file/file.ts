import { join } from "node:path";

export function buildFullFilePath(pathToDir: string, filename: string) {
	return join(pathToDir, filename);
}

export function openFile(filepath: string) {
	return Bun.file(filepath);
}
