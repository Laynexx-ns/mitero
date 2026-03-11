export const PROCESSOR_ERRORS = {
	BATCH_QUEUE_IS_CLOSED: "batch queue is closed",
	ALREADY_PROCESSING: "processor already busy with one process",
	NOT_ACTIVE_PROCESSING: "processor currently have no active tasks",
};
export type ProcessorError =
	(typeof PROCESSOR_ERRORS)[keyof typeof PROCESSOR_ERRORS];
