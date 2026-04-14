import path from "path";
import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config({
  path: path.join(__dirname, "..", "..", ".env"),
});

const requiredEnv = ["PORT", "MONGODB_URI", "JWT_SECRET"] as const;

const parsedVerificationCodeExpiresInMinutes = Number(
  process.env.VERIFICATION_CODE_EXPIRES_IN ?? "10"
);

const verificationCodeExpiresInMinutes =
  Number.isFinite(parsedVerificationCodeExpiresInMinutes) &&
  parsedVerificationCodeExpiresInMinutes > 0
    ? parsedVerificationCodeExpiresInMinutes
    : 10;

type EmbeddingsMode = "strict" | "best-effort";

function parseEmbeddingsMode(value: string | undefined, env: string): EmbeddingsMode {
  if (value === "strict" || value === "best-effort") return value;
  return env === "production" ? "best-effort" : "strict";
}

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
  verificationCodeExpiresInMinutes,
  embeddingsMode: parseEmbeddingsMode(
    process.env.EMBEDDINGS_MODE,
    process.env.NODE_ENV || "development"
  ),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  mongoVideoVectorIndexName: process.env.MONGO_VIDEO_VECTOR_INDEX_NAME || "videos_embedding_index",
};

export default config;

