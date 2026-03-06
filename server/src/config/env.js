const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env in project root
dotenv.config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const requiredEnv = ["PORT", "MONGODB_URI", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    // Fail fast in development if required env variables are missing
    // but avoid leaking which variable in production logs.
    const message =
      process.env.NODE_ENV === "production"
        ? "Server configuration error"
        : `Missing required environment variable: ${key}`;
    throw new Error(message);
  }
});

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;

