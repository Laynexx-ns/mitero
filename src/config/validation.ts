import { z } from "zod";
import type { MiteroConfig } from "./config";

const MiteroConfigSchema = z.object({
	workers: z.number().min(1).max(100).default(5),
	batchSize: z.number().min(1).default(1),
	batchTimeout: z.number().min(10).default(200),
	bounceTimeout: z.number().min(10).default(100),
	watchers: z.record(
		z.string(),
		z.object({
			listen: z.string().or(z.array(z.string())),
			watchPath: z.string().default("./"),
			processExisting: z.boolean().default(false),
			recursive: z.boolean().default(false),
			tag: z.string().optional(),
			exporters: z.array(z.string()).min(1),
			deleteOnProcessEnd: z.boolean().default(false),
		})
	),
});

export function parseConfig(config: unknown): z.infer<MiteroConfig> {
	const result = MiteroConfigSchema.safeParse(config);

	if (!result.success) {
		console.error(result.error);
		process.exit(1);
	}

	return result.data;
}
