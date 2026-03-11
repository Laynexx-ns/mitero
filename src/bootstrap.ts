import { runInBackground } from "./background";
import { loadConfig, type WatcherConfigs } from "./config";
import type { FileExportEvent } from "./events";
import { YandexExporter } from "./plugins";
import { Processor } from "./processor";
import { AsyncQueue } from "./queue";
import { FileWatcher } from "./watcher";
import { EventWorker } from "./worker";

const config = loadConfig();

const eventQueue = new AsyncQueue<FileExportEvent>();

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
				console.log(`sending ${event.id} to eventQueue`);
				eventQueue.push(event);
			}
		);

		console.log(watcher.config.watchPath);
		watcher.watch();

		watchers.push(watcher);
	});
}

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

function waitForSignal(signal: NodeJS.Signals = "SIGINT") {
	return new Promise<void>((resolve) => process.once(signal, resolve));
}

await waitForSignal();
