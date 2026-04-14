import { GoogleGenAI } from "@google/genai";
import config from "../config/env";
import { VIDEO_EMBEDDING_VECTOR_LENGTH } from "../config/vector";
import AppError from "../utils/AppError";

export type VideoEmbeddingMetadata = {
  title: string;
  description?: string;
  tags?: string[];
  duration?: number;
};

export const ACTIVE_VIDEO_EMBEDDING_MODEL = config.geminiEmbeddingModel;

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!config.geminiApiKey) {
    throw new AppError("GEMINI_API_KEY is not configured", 500);
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      vertexai: false,
      apiKey: config.geminiApiKey,
    });
  }

  return geminiClient;
}

function normalizeSegment(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildVideoEmbeddingText(metadata: VideoEmbeddingMetadata): string {
  const title = normalizeSegment(metadata.title);
  const description = normalizeSegment(metadata.description ?? "");
  const tags = (metadata.tags ?? [])
    .map((tag) => normalizeSegment(tag).toLowerCase())
    .filter((tag) => tag.length > 0)
    .join(", ");
  const duration = typeof metadata.duration === "number" ? `${metadata.duration}` : "";

  return [
    `title: ${title}`,
    `description: ${description}`,
    `tags: ${tags}`,
    `duration_seconds: ${duration}`,
  ].join("\n");
}

export async function generateVideoEmbedding(
  metadata: VideoEmbeddingMetadata
): Promise<number[]> {
  const client = getGeminiClient();
  const content = buildVideoEmbeddingText(metadata);

  try {
    const response = await client.models.embedContent({
      model: ACTIVE_VIDEO_EMBEDDING_MODEL,
      contents: content,
      config: {
        outputDimensionality: VIDEO_EMBEDDING_VECTOR_LENGTH,
      },
    });

    const rawValues = response.embeddings?.[0]?.values;

    if (!Array.isArray(rawValues) || rawValues.length !== VIDEO_EMBEDDING_VECTOR_LENGTH) {
      throw new AppError("Gemini returned an invalid embedding shape", 502, {
        expectedLength: VIDEO_EMBEDDING_VECTOR_LENGTH,
        actualLength: Array.isArray(rawValues) ? rawValues.length : null,
      });
    }

    const values = rawValues.map((value) => Number(value));

    if (values.some((value) => Number.isNaN(value))) {
      throw new AppError("Vertex AI returned non-numeric embedding values", 502);
    }

    return values;
  } catch (error) {
    if (error instanceof AppError) throw error;

    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    throw new AppError("Failed to generate video embedding", 502, { cause: message });
  }
}
