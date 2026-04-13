import { z } from "zod";
import { VIDEO_EMBEDDING_VECTOR_LENGTH } from "../models/Video";

const tagSchema = z.string().trim().min(1).transform((tag) => tag.toLowerCase());

const tagsSchema = z.array(tagSchema).transform((tags) => [...new Set(tags)]);

const embeddingSchema = z
  .array(z.number())
  .length(VIDEO_EMBEDDING_VECTOR_LENGTH);

export const createVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().max(5000).optional(),
    tags: tagsSchema.optional(),
    embedding: embeddingSchema.optional(),
    videoURL: z.string().trim().min(1).max(1024),
    duration: z.number().min(0).max(300),
    status: z.enum(["public", "private"]).optional(),
  })
  .strict();

export const updateVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).optional(),
    tags: tagsSchema.optional(),
    embedding: embeddingSchema.optional(),
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
