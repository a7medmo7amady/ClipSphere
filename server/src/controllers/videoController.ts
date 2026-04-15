import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import {
  createVideo,
  getAllPublicVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  createReview,
  getReviewsByVideo,
} from "../services/videoService";
import { v4 as uuidv4 } from "uuid";
import { s3 } from "../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { getVideoDuration } from "../utils/videoProbe";

export const createVideoController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  if (!req.file) return next(new AppError("Please upload a video file", 400));

  // Server-side duration enforcement (strictly < 300s)
  let verifiedDuration: number;
  try {
    verifiedDuration = await getVideoDuration(req.file.buffer);
  } catch (err: any) {
    return next(new AppError("Could not probe video metadata", 400));
  }

  if (verifiedDuration > 300) {
    return next(new AppError("Video duration exceeds 300 seconds (5 minutes) limit", 400));
  }

  const { title, description, status } = req.body;

  // Generate unique S3 key
  const extension = path.extname(req.file.originalname) || ".mp4";
  const s3Key = `videos/${req.user._id}/${uuidv4()}${extension}`;

  // Upload file to S3
  const uploadParams = {
    Bucket: process.env.S3_BUCKET!,
    Key: s3Key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
  } catch (err: any) {
    console.error("S3 Upload Error:", err);
    return next(new AppError("Failed to upload video to storage", 500));
  }

  // Create video record with the S3 key
  // ONLY happens if S3 upload succeeds (Atomic mapping)
  const video = await createVideo(req.user._id.toString(), {
    title,
    description,
    duration: Math.round(verifiedDuration), // Use verified duration
    status,
    videoURL: s3Key,
  });

  res.status(201).json({
    status: "success",
    data: {
      video,
    },
  });
});

export const getAllPublicVideosController = catchAsync(async (_req, res) => {
  const videos = await getAllPublicVideos();

  res.status(200).json({
    status: "success",
    data: {
      videos,
      count: videos.length,
    },
  });
});

export const getVideoController = catchAsync(async (req, res, next) => {
  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const video = await getVideo(videoId);

  res.status(200).json({
    status: "success",
    data: { video },
  });
});

export const updateVideoController = catchAsync(async (req, res, next) => {
  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const video = await updateVideo(videoId, req.body);

  res.status(200).json({
    status: "success",
    data: { video },
  });
});

export const deleteVideoController = catchAsync(async (req, res, next) => {
  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  await deleteVideo(videoId);

  res.status(200).json({
    status: "success",
    message: "Video deleted successfully",
  });
});

export const createReviewController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const review = await createReview(videoId, req.user._id.toString(), req.body);

  res.status(201).json({
    status: "success",
    data: { review },
  });
});

export const getReviewsController = catchAsync(async (req, res, next) => {
  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const reviews = await getReviewsByVideo(videoId);

  res.status(200).json({
    status: "success",
    data: { reviews },
  });
});
