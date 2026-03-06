const morgan = require("morgan");
const config = require("../config/env");

// Log concise request info: method, url, status, response time.
// In production you may want a more detailed or structured logger.
const format = config.env === "production" ? "combined" : "dev";

const requestLogger = morgan(format);

module.exports = requestLogger;

