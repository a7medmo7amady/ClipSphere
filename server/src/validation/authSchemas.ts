import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(200),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(200),
  })
  .strict();

