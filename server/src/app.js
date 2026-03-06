const express = require("express");
const cors = require("cors");
const config = require("./config/env");
const routes = require("./routes");
const requestLogger = require("./middleware/logger");
const applySecurityMiddlewares = require("./middleware/security");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  // Core middleware
  app.use(cors());
  app.use(express.json());

  // Request logging (Method, URL, Status, etc.)
  app.use(requestLogger);

  // Security middleware (NoSQL injection protection)
  applySecurityMiddlewares(app);

  // Routes entry point
  app.use(routes);

  // 404 + global error handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

module.exports = createApp;

