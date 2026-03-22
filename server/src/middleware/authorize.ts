import type { RequestHandler } from "express";
import Video from "../models/Video";
import AppError from "../utils/AppError";

export function restrictTo(...roles: Array<"user" | "admin">): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Authentication required", 401));

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }

    return next();
  };
}

export const requireVideoOwnership: RequestHandler = async (req, _res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const video = await Video.findById(videoId).select("owner");
  if (!video) return next(new AppError("Video not found", 404));

  if (video.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only modify your own videos", 403));
  }

  return next();
};

export const requireVideoOwnershipOrAdmin: RequestHandler = async (req, _res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));

  const videoId = req.params.id?.toString();
  if (!videoId) return next(new AppError("Video ID is required", 400));

  const video = await Video.findById(videoId).select("owner");
  if (!video) return next(new AppError("Video not found", 404));

  const isOwner = video.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError("Only the owner or an admin can delete this video", 403));
  }

  return next();
};
