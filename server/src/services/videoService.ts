import Video from "../models/Video";
import Review from "../models/Review";
import AppError from "../utils/AppError";
import { createDownloadUrl, deleteFile } from "../utils/presign";

type CreateVideoPayload = {
  title: string;
  description?: string;
  videoURL: string;
  duration: number;
  status?: "public" | "private";
};

type UpdateVideoPayload = {
  title?: string;
  description?: string;
};

type CreateReviewPayload = {
  rating: number;
  comment: string;
};

export async function createVideo(ownerId: string, payload: CreateVideoPayload) {
  const video = await Video.create({
    title: payload.title,
    description: payload.description ?? "",
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

  const video = await Video.findByIdAndUpdate(videoId, updates, {
    new: true,
    runValidators: true,
  });

  if (!video) throw new AppError("Video not found", 404);
  return video;
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

    return review;
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new AppError("You have already reviewed this video", 409);
    }

    throw error;
  }
}
