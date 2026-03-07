import { z } from "zod";

const booleanOptional = z.boolean().optional();

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    bio: z.string().trim().max(240).optional(),
    avatarKey: z.string().trim().min(1).max(512).optional(),
  })
  .strict();

/** In-app / Email alert toggles for notifications. */
export const updatePreferencesSchema = z
  .object({
    inApp: z
      .object({
        followers: booleanOptional,
        comments: booleanOptional,
        likes: booleanOptional,
        tips: booleanOptional,
      })
      .strict()
      .optional(),
    email: z
      .object({
        followers: booleanOptional,
        comments: booleanOptional,
        likes: booleanOptional,
        tips: booleanOptional,
      })
      .strict()
      .optional(),
  })
  .strict();

