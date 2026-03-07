import type { Request, Response, NextFunction } from "express";
import config from "../config/env";
import AppError from "../utils/AppError";

function normalizeError(err: unknown): unknown {
  const anyErr = err as any;

  // Mongo duplicate key error (e.g. unique email constraint)
  if (anyErr && anyErr.code === 11000) {
    const fields = anyErr.keyValue || {};
    const field = Object.keys(fields)[0] || "field";
    const value = fields[field];
    return new AppError(`${field} already in use`, 409, value ? { field, value } : { field });
  }

  // Zod schema validation error
  if (anyErr && anyErr.name === "ZodError" && Array.isArray(anyErr.issues)) {
    const details = anyErr.issues.map((issue: any) => ({
      path: Array.isArray(issue.path) ? issue.path.join(".") : "",
      message: issue.message,
      code: issue.code,
    }));
    return new AppError("Validation error", 400, details);
  }

  return err;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const normalized = normalizeError(err);
  const safeErr: any = normalized instanceof Error ? normalized : err;

  const statusCode = safeErr.statusCode || 500;
  const status = safeErr.status || "error";

  const response: Record<string, unknown> = {
    status,
    message:
      config.env === "production" && !safeErr.isOperational
        ? "Something went wrong"
        : safeErr.message || "Something went wrong",
  };

  if (safeErr.details) response.details = safeErr.details;
  if (config.env !== "production") response.stack = safeErr.stack;

  res.status(statusCode).json(response);
}

