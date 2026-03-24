import { z } from "zod";

export const logWatchSchema = z
  .object({
    videoId: z.string().trim().min(1),
    watchDuration: z.number().min(0).max(300),
    completed: z.boolean(),
  })
  .strict();
