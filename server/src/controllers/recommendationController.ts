import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import {
  recommendSimilarVideos,
  recommendVideosForUser,
} from "../services/recommendationService";

function parseLimit(value: unknown) {
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const similarVideosController = catchAsync(async (req, res, next) => {
  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const limit = parseLimit(req.query.limit);
  const videos = await recommendSimilarVideos(videoId, { limit });

  res.status(200).json({
    status: "success",
    data: {
      videos,
      count: videos.length,
    },
  });
});

export const userRecommendationFeedController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  const limit = parseLimit(req.query.limit);
  const historyLimit = parseLimit(req.query.historyLimit);

  const videos = await recommendVideosForUser(req.user._id.toString(), {
    limit,
    historyLimit,
  });

  res.status(200).json({
    status: "success",
    data: {
      videos,
      count: videos.length,
    },
  });
});
