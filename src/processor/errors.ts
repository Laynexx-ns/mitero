export const PROCESSOR_ERRORS = {
	BATCH_QUEUE_IS_CLOSED: "batch queue is closed",
};
export type ProcessorError =
	(typeof PROCESSOR_ERRORS)[keyof typeof PROCESSOR_ERRORS];
