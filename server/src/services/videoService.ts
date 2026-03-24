import Video from "../models/Video";
import Review from "../models/Review";
import AppError from "../utils/AppError";

type CreateVideoPayload = {
  title: string;
  description?: string;
  tags?: string[];
  embedding?: number[];
  videoURL: string;
  duration: number;
  status?: "public" | "private";
};

type UpdateVideoPayload = {
  title?: string;
  description?: string;
  tags?: string[];
  embedding?: number[];
};

type CreateReviewPayload = {
  rating: number;
  comment: string;
};

export async function createVideo(ownerId: string, payload: CreateVideoPayload) {
  const video = await Video.create({
    title: payload.title,
    description: payload.description ?? "",
    tags: payload.tags ?? [],
    embedding: payload.embedding,
    owner: ownerId,
    videoURL: payload.videoURL,
    duration: payload.duration,
    status: payload.status ?? "public",
  });

  return video;
}

export async function getAllPublicVideos() {
  const videos = await Video.find({ status: "public" })
    .sort({ createdAt: -1 })
    .populate("owner", "username name avatarKey");

  return videos;
}

export async function updateVideo(videoId: string, payload: UpdateVideoPayload) {
  const updates: UpdateVideoPayload = {};

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.tags !== undefined) updates.tags = payload.tags;
  if (payload.embedding !== undefined) updates.embedding = payload.embedding;

  const video = await Video.findByIdAndUpdate(videoId, updates, {
    new: true,
    runValidators: true,
  });

  if (!video) throw new AppError("Video not found", 404);
  return video;
}

export async function deleteVideo(videoId: string) {
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) throw new AppError("Video not found", 404);
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

    return review;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new AppError("You have already reviewed this video", 409);
    }

    throw error;
  }
}
