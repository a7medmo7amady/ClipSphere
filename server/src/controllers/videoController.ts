import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import {
  createVideo,
  getAllPublicVideos,
  updateVideo,
  deleteVideo,
  createReview,
} from "../services/videoService";

export const createVideoController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  const video = await createVideo(req.user._id.toString(), req.body);

  res.status(201).json({
    status: "success",
    data: { video },
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
