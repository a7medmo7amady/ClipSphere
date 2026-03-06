import { z } from "zod";

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    bio: z.string().trim().max(240).optional(),
  })
  .strict();

export const updateAvatarSchema = z
  .object({
    objectName: z.string().trim().min(1).max(512),
  })
  .strict();

