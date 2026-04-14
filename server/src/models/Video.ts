import { Schema, model, Types, type HydratedDocument } from "mongoose";
import { VIDEO_EMBEDDING_VECTOR_LENGTH } from "../config/vector";

function normalizeTags(tags: string[] = []): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()))].filter(
    (tag) => tag.length > 0
  );
}

export interface IVideo {
  title: string;
  description: string;
  tags: string[];
  embedding?: number[];
  embeddingUpdatedAt?: Date;
  embeddingModel?: string;
  embeddingStatus?: "pending" | "ready" | "failed";
  embeddingLastError?: string;
  embeddingRetryCount?: number;
  embeddingNextRetryAt?: Date;
  owner: Types.ObjectId;
  videoURL: string;
  duration: number;
  viewsCount: number;
  reviewsCount: number;
  avgRating: number;
  trendingScore: number;
  status: "public" | "private" | "flagged";
  createdAt: Date;
  updatedAt: Date;
}

export type VideoDocument = HydratedDocument<IVideo>;

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      set: normalizeTags,
      index: true,
    },
    embedding: {
      type: [Number],
      default: undefined,
      validate: {
        validator(value: number[] | undefined) {
          return (
            value === undefined ||
            value.length === VIDEO_EMBEDDING_VECTOR_LENGTH
          );
        },
        message: `Embedding must contain exactly ${VIDEO_EMBEDDING_VECTOR_LENGTH} numbers`,
      },
    },
    embeddingUpdatedAt: {
      type: Date,
    },
    embeddingModel: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    embeddingStatus: {
      type: String,
      enum: ["pending", "ready", "failed"],
      default: "pending",
      index: true,
    },
    embeddingLastError: {
      type: String,
      maxlength: 2000,
    },
    embeddingRetryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    embeddingNextRetryAt: {
      type: Date,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videoURL: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    trendingScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["public", "private", "flagged"],
      default: "public",
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ owner: 1, createdAt: -1 });

const Video = model<IVideo>("Video", videoSchema);

export default Video;

