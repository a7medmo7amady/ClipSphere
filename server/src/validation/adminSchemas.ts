import { z } from "zod";

export const updateUserStatusSchema = z
  .object({
    active: z.boolean().optional(),
    accountStatus: z.enum(["active", "banned"]).optional(),
  })
  .strict()
  .refine((payload) => payload.active !== undefined || payload.accountStatus !== undefined, {
    message: "At least one field is required",
  });

export const promoteToAdminSchema = z.object({}).strict();
