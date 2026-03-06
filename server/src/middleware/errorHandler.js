const config = require("../config/env");
const AppError = require("../utils/AppError");

function normalizeError(err) {
  // Mongo duplicate key error (e.g. unique email constraint)
  if (err && err.code === 11000) {
    const fields = err.keyValue || {};
    const field = Object.keys(fields)[0] || "field";
    const value = fields[field];
    return new AppError(
      `${field} already in use`,
      409,
      value ? { field, value } : { field }
    );
  }

  // Zod schema validation error
  if (err && err.name === "ZodError" && Array.isArray(err.issues)) {
    const details = err.issues.map((issue) => ({
      path: issue.path?.join(".") || "",
      message: issue.message,
      code: issue.code,
    }));
    return new AppError("Validation error", 400, details);
  }

  return err;
}

// 404 handler for unknown routes
function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

// Global error handling middleware
// Ensures consistent JSON error responses and avoids leaking stack traces
// in production.
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const normalized = normalizeError(err);
  const safeErr = normalized instanceof Error ? normalized : err;

  const statusCode = safeErr.statusCode || 500;
  const status = safeErr.status || "error";

  const response = {
    status,
    message:
      config.env === "production" && !safeErr.isOperational
        ? "Something went wrong"
        : safeErr.message || "Something went wrong",
  };

  if (safeErr.details) {
    response.details = safeErr.details;
  }

  if (config.env !== "production") {
    response.stack = safeErr.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};

