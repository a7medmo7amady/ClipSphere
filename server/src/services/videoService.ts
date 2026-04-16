import Video from "../models/Video";
import Review from "../models/Review";
import Like from "../models/Like";
import AppError from "../utils/AppError";
import User from "../models/User";
import { createNotification } from "./notificationService";
import config from "../config/env";
import {
  ACTIVE_VIDEO_EMBEDDING_MODEL,
  generateVideoEmbedding,
} from "./embeddingService";
import { createDownloadUrl, deleteFile } from "../utils/presign";

type CreateVideoPayload = {
  title: string;
  description?: string;
  tags?: string[];
  videoURL: string;
  duration: number;
  status?: "public" | "private";
};

type UpdateVideoPayload = {
  title?: string;
  description?: string;
  tags?: string[];
};

type CreateReviewPayload = {
  rating: number;
  comment: string;
};

async function refreshVideoEmbedding(videoId: string) {
  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const embedding = await generateVideoEmbedding({
    title: video.title,
    description: video.description,
    tags: video.tags,
    duration: video.duration,
  });

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      embedding,
      embeddingUpdatedAt: new Date(),
      embeddingModel: ACTIVE_VIDEO_EMBEDDING_MODEL,
      embeddingStatus: "ready",
      embeddingLastError: undefined,
      embeddingNextRetryAt: undefined,
    },
    { new: true, runValidators: true }
  );

  if (!updatedVideo) throw new AppError("Video not found", 404);
  return updatedVideo;
}

function safeErrorString(error: unknown) {
  if (error instanceof Error) return error.stack || error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function computeNextRetryAt(retryCount: number) {
  const baseMs = 30_000; // 30s
  const maxMs = 15 * 60_000; // 15m
  const delayMs = Math.min(maxMs, baseMs * Math.pow(2, Math.min(retryCount, 5)));
  return new Date(Date.now() + delayMs);
}

export async function createVideo(ownerId: string, payload: CreateVideoPayload) {
  const video = await Video.create({
    title: payload.title,
    description: payload.description ?? "",
    tags: payload.tags ?? [],
    owner: ownerId,
    videoURL: payload.videoURL,
    duration: payload.duration,
    status: payload.status ?? "public",
  });

  try {
    return await refreshVideoEmbedding(video._id.toString());
  } catch (error) {
    const errorText = safeErrorString(error).slice(0, 2000);
    console.error("[embedding] createVideo embedding update failed", {
      videoId: video._id.toString(),
      error: errorText,
    });

    const retryCount = (video.embeddingRetryCount ?? 0) + 1;
    await Video.findByIdAndUpdate(video._id, {
      embeddingStatus: "failed",
      embeddingLastError: errorText,
      embeddingRetryCount: retryCount,
      embeddingNextRetryAt: computeNextRetryAt(retryCount),
      embeddingModel: ACTIVE_VIDEO_EMBEDDING_MODEL,
    });

    if (config.embeddingsMode === "strict") throw error;
    return video;
  }
}

export async function getVideosByOwner(ownerId: string) {
  const videos = await Video.find({ owner: ownerId, status: "public" })
    .sort({ createdAt: -1 })
    .populate("owner", "username name avatarKey");

  const videosWithUrls = await Promise.all(
    videos.map(async (v) => {
      const video = v.toObject();
      try {
        video.videoURL = await createDownloadUrl(video.videoURL);
      } catch (error) {
        console.error(`Failed to generate download URL for video ${video._id}:`, error);
      }
      return video;
    })
  );

  return videosWithUrls;
}

export async function getAllPublicVideos() {
  const videos = await Video.find({ status: "public" })
    .sort({ createdAt: -1 })
    .populate("owner", "username name avatarKey");

  // Generate presigned URLs for each video
  const videosWithUrls = await Promise.all(
    videos.map(async (v) => {
      const video = v.toObject();
      try {
        // Assume videoURL stores the S3 key
        video.videoURL = await createDownloadUrl(video.videoURL);
      } catch (error) {
        console.error(`Failed to generate download URL for video ${video._id}:`, error);
        // Fallback to original or null if failed
      }
      return video;
    })
  );

  return videosWithUrls;
}

export async function getVideo(videoId: string) {
  const video = await Video.findById(videoId)
    .populate("owner", "username name avatarKey");

  if (!video) throw new AppError("Video not found", 404);

  const videoObj = video.toObject();
  try {
    videoObj.videoURL = await createDownloadUrl(videoObj.videoURL);
  } catch (error) {
    console.error(`Failed to generate download URL for video ${videoId}:`, error);
  }

  return videoObj;
}

export async function updateVideo(videoId: string, payload: UpdateVideoPayload) {
  const updates: UpdateVideoPayload = {};

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.tags !== undefined) updates.tags = payload.tags;

  const video = await Video.findByIdAndUpdate(videoId, updates, {
    new: true,
    runValidators: true,
  });

  if (!video) throw new AppError("Video not found", 404);

  const shouldRefreshEmbedding =
    payload.title !== undefined ||
    payload.description !== undefined ||
    payload.tags !== undefined;

  if (!shouldRefreshEmbedding) return video;

  try {
    return await refreshVideoEmbedding(videoId);
  } catch (error) {
    const errorText = safeErrorString(error).slice(0, 2000);
    console.error("[embedding] updateVideo embedding update failed", {
      videoId,
      error: errorText,
    });

    const retryCount = (video.embeddingRetryCount ?? 0) + 1;
    await Video.findByIdAndUpdate(videoId, {
      embeddingStatus: "failed",
      embeddingLastError: errorText,
      embeddingRetryCount: retryCount,
      embeddingNextRetryAt: computeNextRetryAt(retryCount),
      embeddingModel: ACTIVE_VIDEO_EMBEDDING_MODEL,
    });

    if (config.embeddingsMode === "strict") throw error;
    return video;
  }
}

export async function deleteVideo(videoId: string) {
  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  // Delete from S3
  await deleteFile(video.videoURL);

  // Delete from DB
  await video.deleteOne();
}

export async function createReview(videoId: string, userId: string, payload: CreateReviewPayload) {
  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  try {
    const review = await Review.create({
      rating: payload.rating,
      comment: payload.comment,
      user: userId,
      video: videoId,
    });

    const actor = await User.findById(userId).select("username name");
    const actorName = actor?.name ?? actor?.username ?? "Someone";
    createNotification({
      recipientId: video.owner.toString(),
      actorId: userId,
      type: "review",
      message: `${actorName} reviewed your video "${video.title}".`,
      link: `/video/${videoId}`,
    }).catch(() => {});

    return review;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new AppError("You have already reviewed this video", 409);
    }

    throw error;
  }
}

export async function getReviewsByVideo(videoId: string) {
  const reviews = await Review.find({ video: videoId })
    .sort({ createdAt: -1 })
    .populate("user", "username name avatarKey");

  return reviews;
}

export async function likeVideo(videoId: string, userId: string) {
  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  try {
    await Like.create({ user: userId, video: videoId });
    await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });
    
    try {
      if (video.owner.toString() !== userId) {
        await createNotification({
          recipientId: video.owner.toString(),
          actorId: userId,
          type: "like",
          message: "liked your video",
          link: `/video/${video._id}`
        });
      }
    } catch (err) {
      console.error("Failed to create like notification", err);
    }
    
    return true;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new AppError("You have already liked this video", 409);
    }
    throw error;
  }
}

export async function unlikeVideo(videoId: string, userId: string) {
  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const result = await Like.deleteOne({ user: userId, video: videoId });
  if (result.deletedCount && result.deletedCount > 0) {
    await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
  }
  return true;
}

export async function checkHasLiked(videoId: string, userId: string) {
  const like = await Like.findOne({ user: userId, video: videoId });
  return !!like;
}

export async function incrementVideoView(videoId: string) {
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { viewsCount: 1 } },
    { new: true }
  );
  if (!video) throw new AppError("Video not found", 404);
  return video;
}
