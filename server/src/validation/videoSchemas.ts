import { z } from "zod";

export const createVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().max(5000).optional(),
    tags: z.array(z.string()).optional(),
    embedding: z.array(z.number()).optional(),
    videoURL: z.string().trim().min(1).max(1024),
    duration: z.number().min(0).max(300),
    status: z.enum(["public", "private"]).optional(),
  })
  .strict();

export const updateVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).optional(),
    tags: z.array(z.string()).optional(),
    embedding: z.array(z.number()).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.tags !== undefined ||
      data.embedding !== undefined,
    {
    message: "At least one field is required",
  }
  );

export const createReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(10).max(2000),
  })
  .strict();
