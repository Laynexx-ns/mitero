export const ASYNC_QUEUE_ERRORS = {
	QUEUE_IS_CLOSED: "queue is closed",
	NO_ITEMS: "no items in queue",
	NO_ITEMS_TO_MODIFY: "no items in queue to modify",
} as const;
export type QueueError =
	(typeof ASYNC_QUEUE_ERRORS)[keyof typeof ASYNC_QUEUE_ERRORS];
