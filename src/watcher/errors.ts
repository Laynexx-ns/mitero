export const WATCHER_ERRORS = {
	WATCHER_NOT_EXISTS: "watcher not exists",
};
export type WatcherError = (typeof WATCHER_ERRORS)[keyof typeof WATCHER_ERRORS];
