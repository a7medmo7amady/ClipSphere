import { z } from "zod";

export const createVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().max(5000).optional(),
    duration: z.coerce.number().min(0).max(3600),
    status: z.enum(["public", "private"]).optional(),
  })
  .strict();

export const updateVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "At least one field is required",
  });

export const createReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(10).max(2000),
  })
  .strict();
