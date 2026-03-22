import mongoose from "mongoose";
import User from "../models/User";
import Video from "../models/Video";
import Review from "../models/Review";
import AppError from "../utils/AppError";

type UpdateUserStatusPayload = {
  active?: boolean;
  accountStatus?: "active" | "banned";
};

export async function getAdminHealth() {
  return {
    service: "ClipSphere API",
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    database: {
      state: mongoose.connection.readyState,
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getAdminStats() {
  const [totalUsers, totalVideos, mostActiveUsers] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),
    Video.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: "$owner",
          videosCreated: { $sum: 1 },
        },
      },
      {
        $sort: {
          videosCreated: -1,
        },
      },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          username: "$user.username",
          name: "$user.name",
          videosCreated: 1,
        },
      },
    ]),
  ]);

  return {
    totals: {
      users: totalUsers,
      videos: totalVideos,
      tips: 0,
    },
    mostActiveUsers,
  };
}

export async function updateUserStatus(userId: string, payload: UpdateUserStatusPayload) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (payload.active !== undefined) user.active = payload.active;
  if (payload.accountStatus !== undefined) user.accountStatus = payload.accountStatus;

  await user.save();
  return user;
}

export async function getModerationQueue() {
  const flaggedVideos = await Video.find({ status: "flagged" })
    .sort({ updatedAt: -1 })
    .populate("owner", "username name");

  const lowRatedVideos = await Review.aggregate([
    {
      $group: {
        _id: "$video",
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
    {
      $match: {
        averageRating: { $lte: 2 },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "_id",
        as: "video",
      },
    },
    { $unwind: "$video" },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        _id: 0,
        videoId: "$video._id",
        title: "$video.title",
        status: "$video.status",
        averageRating: { $round: ["$averageRating", 2] },
        reviewsCount: 1,
        owner: {
          id: "$owner._id",
          username: "$owner.username",
          name: "$owner.name",
        },
        updatedAt: "$video.updatedAt",
      },
    },
    {
      $sort: {
        averageRating: 1,
        reviewsCount: -1,
      },
    },
  ]);

  return {
    flaggedVideos,
    lowRatedVideos,
  };
}
