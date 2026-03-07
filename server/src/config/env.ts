import path from "path";
import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const requiredEnv = ["PORT", "MONGODB_URI", "JWT_SECRET"] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    const message =
      process.env.NODE_ENV === "production"
        ? "Server configuration error"
        : `Missing required environment variable: ${key}`;
    throw new Error(message);
  }
});

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || "24h") as SignOptions["expiresIn"],
};

export default config;

