import { Types } from "mongoose";
import config from "../config/env";
import { VIDEO_EMBEDDING_VECTOR_LENGTH } from "../config/vector";
import User from "../models/User";
import Video from "../models/Video";
import WatchHistory from "../models/WatchHistory";
import AppError from "../utils/AppError";
import { generateVideoEmbedding } from "./embeddingService";
import { createDownloadUrl } from "../utils/presign";

async function attachPresignedUrls(videos: any[]) {
  return Promise.all(
    videos.map(async (v) => {
      if (!v.videoURL) return v;
      try {
        return { ...v, videoURL: await createDownloadUrl(v.videoURL) };
      } catch {
        return v;
      }
    })
  );
}

type RecommendByVectorOptions = {
  limit?: number;
  numCandidates?: number;
  tags?: string[];
  excludeVideoId?: string;
  excludeOwnerId?: string;
  status?: "public" | "private" | "flagged";
};

type SimilarVideosOptions = {
  limit?: number;
  numCandidates?: number;
  tags?: string[];
};

type UserFeedOptions = {
  limit?: number;
  numCandidates?: number;
  historyLimit?: number;
};

function normalizeTags(tags: string[] = []) {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()))].filter(
    (tag) => tag.length > 0
  );
}

function assertVectorLength(vector: number[], label: string) {
  if (vector.length !== VIDEO_EMBEDDING_VECTOR_LENGTH) {
    throw new AppError(
      `${label} must contain exactly ${VIDEO_EMBEDDING_VECTOR_LENGTH} numbers`,
      400
    );
  }
}

function averageVectors(vectors: number[][]) {
  if (vectors.length === 0) {
    throw new AppError("No vectors to average", 400);
  }

  vectors.forEach((vector, index) => {
    assertVectorLength(vector, `Vector at index ${index}`);
  });

  const sum = new Array<number>(VIDEO_EMBEDDING_VECTOR_LENGTH).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < sum.length; i += 1) {
      sum[i] += vector[i] ?? 0;
    }
  }

  return sum.map((value) => value / vectors.length);
}

function weightedAverageVectors(vectors: number[][], weights: number[]) {
  if (vectors.length === 0) {
    throw new AppError("No vectors to average", 400);
  }
  if (vectors.length !== weights.length) {
    throw new AppError("Vectors/weights length mismatch", 400);
  }

  vectors.forEach((vector, index) => {
    assertVectorLength(vector, `Vector at index ${index}`);
  });

  const sum = new Array<number>(VIDEO_EMBEDDING_VECTOR_LENGTH).fill(0);
  let weightSum = 0;

  for (let row = 0; row < vectors.length; row += 1) {
    const weight = Number.isFinite(weights[row]) ? Math.max(0, weights[row]) : 0;
    if (weight === 0) continue;
    weightSum += weight;

    const vector = vectors[row];
    for (let i = 0; i < sum.length; i += 1) {
      sum[i] += (vector[i] ?? 0) * weight;
    }
  }

  if (weightSum === 0) {
    throw new AppError("Not enough watch duration to build recommendations", 409);
  }

  return sum.map((value) => value / weightSum);
}

async function trendingVideos(limit: number) {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  const now = new Date();
  const msPerDay = 86_400_000;

  const results = await Video.aggregate([
    { $match: { status: "public" } },
    {
      $lookup: {
        from: "reviews",
        let: { videoId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              reviewsCount: { $sum: 1 },
            },
          },
        ],
        as: "reviewStats",
      },
    },
    {
      $set: {
        avgRating: {
          $ifNull: [{ $first: "$reviewStats.avgRating" }, 0],
        },
        reviewsCount: {
          $ifNull: [{ $first: "$reviewStats.reviewsCount" }, 0],
        },
      },
    },
    {
      $set: {
        ageDays: {
          $divide: [{ $subtract: [now, "$createdAt"] }, msPerDay],
        },
      },
    },
    {
      $set: {
        recencyFactor: {
          $divide: [1, { $add: [1, "$ageDays"] }],
        },
        score: {
          $add: ["$avgRating", { $divide: [1, { $add: [1, "$ageDays"] }] }],
        },
      },
    },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: safeLimit },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        pipeline: [{ $project: { username: 1, name: 1, avatarKey: 1 } }],
        as: "ownerData",
      },
    },
    { $set: { owner: { $first: "$ownerData" } } },
    {
      $project: {
        title: 1,
        description: 1,
        tags: 1,
        owner: 1,
        videoURL: 1,
        duration: 1,
        viewsCount: 1,
        reviewsCount: 1,
        avgRating: 1,
        status: 1,
        embeddingUpdatedAt: 1,
        embeddingModel: 1,
        createdAt: 1,
        updatedAt: 1,
        score: 1,
      },
    },
  ]);

  return attachPresignedUrls(results);
}

export async function recommendTrendingVideos(limit = 12) {
  return trendingVideos(limit);
}

export async function recommendVideosByVector(
  queryVector: number[],
  options: RecommendByVectorOptions = {}
) {
  assertVectorLength(queryVector, "Query vector");

  const limit = Math.max(1, Math.min(options.limit ?? 12, 50));
  const numCandidates = Math.max(
    limit,
    options.numCandidates ?? Math.max(limit * 10, 50)
  );

  const filter: Record<string, unknown> = {
    status: options.status ?? "public",
  };

  const tags = normalizeTags(options.tags ?? []);
  if (tags.length > 0) filter.tags = { $in: tags };

  if (options.excludeVideoId) {
    filter._id = { $ne: new Types.ObjectId(options.excludeVideoId) };
  }

  if (options.excludeOwnerId) {
    filter.owner = { $ne: new Types.ObjectId(options.excludeOwnerId) };
  }

  const results = await Video.aggregate([
    {
      $vectorSearch: {
        index: config.mongoVideoVectorIndexName,
        path: "embedding",
        queryVector,
        numCandidates,
        limit,
        filter,
      },
    },
    {
      $set: {
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        pipeline: [{ $project: { username: 1, name: 1, avatarKey: 1 } }],
        as: "ownerData",
      },
    },
    { $set: { owner: { $first: "$ownerData" } } },
    {
      $project: {
        title: 1,
        description: 1,
        tags: 1,
        owner: 1,
        videoURL: 1,
        duration: 1,
        viewsCount: 1,
        reviewsCount: 1,
        avgRating: 1,
        trendingScore: 1,
        status: 1,
        embeddingUpdatedAt: 1,
        embeddingModel: 1,
        createdAt: 1,
        updatedAt: 1,
        score: 1,
      },
    },
  ]);

  return attachPresignedUrls(results);
}

export async function recommendVideosFromTextQuery(
  queryText: string,
  options: RecommendByVectorOptions = {}
) {
  const normalized = queryText.trim();
  if (!normalized) throw new AppError("queryText is required", 400);

  const queryVector = await generateVideoEmbedding({ title: normalized });
  return recommendVideosByVector(queryVector, options);
}

export async function recommendSimilarVideos(videoId: string, options: SimilarVideosOptions = {}) {
  const video = await Video.findById(videoId);
  if (!video || video.status !== "public") throw new AppError("Video not found", 404);

  const embedding = video.embedding;
  if (!embedding) {
    throw new AppError("Video embedding is not available yet", 409);
  }

  assertVectorLength(embedding, "Video embedding");

  return recommendVideosByVector(embedding, {
    limit: options.limit,
    numCandidates: options.numCandidates,
    tags: options.tags,
    excludeVideoId: videoId,
    status: "public",
  });
}

export async function computeUserEmbeddingFromWatchHistory(
  userId: string,
  options: { historyLimit?: number } = {}
) {
  const historyLimit = Math.max(1, Math.min(options.historyLimit ?? 50, 200));

  const entries = await WatchHistory.find({ user: userId })
    .sort({ watchedAt: -1 })
    .limit(historyLimit)
    .populate("video", "embedding status")
    .lean();

  const uniqueVectors: number[][] = [];
  const uniqueWeights: number[] = [];
  const seenVideoIds = new Set<string>();

  for (const entry of entries) {
    const video = entry.video as unknown as {
      _id?: unknown;
      status?: string;
      embedding?: number[];
    };

    const id = video?._id ? String(video._id) : "";
    if (!id || seenVideoIds.has(id)) continue;
    seenVideoIds.add(id);

    if (video.status !== "public") continue;
    if (!video.embedding) continue;

    uniqueVectors.push(video.embedding);
    uniqueWeights.push(Number(entry.watchDuration ?? 0));
  }

  if (uniqueVectors.length === 0) {
    throw new AppError(
      "Not enough watch history embeddings to build recommendations",
      409
    );
  }

  return weightedAverageVectors(uniqueVectors, uniqueWeights);
}

export async function recommendVideosForUser(userId: string, options: UserFeedOptions = {}) {
  const limit = Math.max(1, Math.min(options.limit ?? 12, 50));

  const user = await User.findById(userId).select(
    "+recommendationEmbedding +recommendationEmbeddingStatus"
  );

  if (
    user &&
    user.recommendationEmbeddingStatus === "ready" &&
    Array.isArray(user.recommendationEmbedding)
  ) {
    return recommendVideosByVector(user.recommendationEmbedding, {
      limit,
      numCandidates: options.numCandidates,
      status: "public",
    });
  }

  return trendingVideos(limit);
}
