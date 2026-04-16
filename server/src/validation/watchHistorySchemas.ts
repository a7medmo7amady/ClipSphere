import { Types } from "mongoose";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });

export const logWatchSchema = z
  .object({
    videoId: objectIdSchema,
    watchDuration: z.number().min(0),
    completed: z.boolean(),
  })
  .strict();
