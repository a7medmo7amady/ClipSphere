import catchAsync from "../utils/catchAsync";
import {
  getUserById,
  updateUser,
  updatePreferences,
} from "../services/userService";
import {
  follow,
  unfollow,
  getFollowers,
  getFollowing,
} from "../services/followService";
import { getVideosByOwner } from "../services/videoService";
import AppError from "../utils/AppError";

export const getMeController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const user = await getUserById(req.user._id.toString());
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

export const getUserByIdController = catchAsync(async (req, res, next) => {
  const userId = req.params.id?.toString();
  if (!userId) return next(new AppError("User ID is required", 400));
  const user = await getUserById(userId);
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({
    status: "success",
    data: user.toPublicJSON(),
  });
});

export const updateMeController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  const updates = req.route.path.includes("avatar")
    ? { avatarKey: req.body.objectName as string }
    : req.body;

  const user = await updateUser(req.user._id.toString(), updates);
  res.status(200).json({
    status: "success",
    data: { user: user.toPublicJSON() },
  });
});

export const updatePreferencesController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const user = await updatePreferences(req.user._id.toString(), req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

function getIdParam(req: { params: { id?: string | string[] } }): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : (id ?? "");
}

export const followController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const result = await follow(req.user._id.toString(), getIdParam(req));
  res.status(200).json({
    status: "success",
    message: result.message,
  });
});

export const unfollowController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const result = await unfollow(req.user._id.toString(), getIdParam(req));
  res.status(200).json({
    status: "success",
    message: result.message,
  });
});

export const getFollowersController = catchAsync(async (req, res) => {
  const list = await getFollowers(getIdParam(req));
  res.status(200).json({
    status: "success",
    data: {
      followers: list,
      count: list.length,
    },
  });
});

export const getFollowingController = catchAsync(async (req, res) => {
  const list = await getFollowing(getIdParam(req));
  res.status(200).json({
    status: "success",
    data: {
      following: list,
      count: list.length,
    },
  });
});

export const getUserVideosController = catchAsync(async (req, res, next) => {
  const userId = req.params.id?.toString();
  if (!userId) return next(new AppError("User ID is required", 400));
  const videos = await getVideosByOwner(userId);
  res.status(200).json({
    status: "success",
    data: { videos, count: videos.length },
  });
});

