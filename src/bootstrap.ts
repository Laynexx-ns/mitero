import { runInBackground } from "./background";
import { loadConfig, type WatcherConfigs } from "./config";
import { AutoDebouncer } from "./debouncer";
import type { FileExportEvent } from "./events";
import { buildFullFilePath } from "./file";
import { YandexExporter } from "./plugins";
import { Processor } from "./processor";
import { AsyncQueue } from "./queue";
import { FileWatcher } from "./watcher";
import { EventWorker } from "./worker";

const config = loadConfig();

const eventQueue = new AsyncQueue<FileExportEvent>();
const autoDebouncer = new AutoDebouncer<string, FileExportEvent>({
	pushSource: eventQueue,
	interval: config.bounceTimeout,
});

// watchers setup and run
const watchers: FileWatcher[] = [];
function setupWatchers(watcherConfigs: WatcherConfigs) {
	Object.entries(watcherConfigs).forEach(([name, config]) => {
		const watcher = new FileWatcher(
			{
				config,
				name,
			},
			(event) => {
				console.log(
					` ${new Date().toLocaleTimeString("ru-RU")} | watcher: ${name} sending ${event.id} to eventQueue | type: ${event.event}`
				);

				const fullPath: string = buildFullFilePath(
					event.path,
					event.filename ?? ""
				);
				console.log(`fullpath: ${fullPath}`);

				autoDebouncer.push(fullPath, event);
			}
		);

		console.log(`watcher ${name} enabled | looking for: ${config.watchPath}`);
		watcher.watch();

		watchers.push(watcher);
	});
}

autoDebouncer.debounce();

setupWatchers(config.watchers);

// processor setup and run
const processor = new Processor({
	batchSize: config.batchSize,
	batchTimeout: config.batchTimeout,
});
runInBackground(processor.process(eventQueue));

// workers setup and run
const exporters = [YandexExporter];
const _workers: EventWorker[] = [];
for (let i = 0; i < config.workers; i++) {
	const worker = new EventWorker({
		exporters,
		workerId: i,
	});
	runInBackground(worker.listenQueue(processor.batchQueue));
}

function waitForSignal(signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"]) {
	return new Promise<void>((resolve) => {
		const handler = () => {
			signals.forEach((signal) => process.off(signal, handler));
			resolve();
		};
		signals.forEach((signal) => process.once(signal, handler));
	});
}

await waitForSignal();
autoDebouncer.stop();
processor.stop();
