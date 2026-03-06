const config = require("../config/env");
const AppError = require("../utils/AppError");

// 404 handler for unknown routes
function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

// Global error handling middleware
// Ensures consistent JSON error responses and avoids leaking stack traces
// in production.
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  const response = {
    status,
    message:
      config.env === "production" && !err.isOperational
        ? "Something went wrong"
        : err.message || "Something went wrong",
  };

  if (config.env !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};

