import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import AppError from "../utils/AppError";

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Validation error", 400, parsed.error.issues));
    }
    req.body = parsed.data;
    return next();
  };
}

