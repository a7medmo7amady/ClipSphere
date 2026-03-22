import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import {
  getAdminHealth,
  getAdminStats,
  updateUserStatus,
  getModerationQueue,
} from "../services/adminService";

export const adminHealthController = catchAsync(async (_req, res) => {
  const health = await getAdminHealth();
  res.status(200).json({
    status: "success",
    data: health,
  });
});

export const getStatsController = catchAsync(async (_req, res) => {
  const stats = await getAdminStats();
  res.status(200).json({
    status: "success",
    data: stats,
  });
});

export const updateUserStatusController = catchAsync(async (req, res, next) => {
  const userId = req.params.id?.toString();
  if (!userId) return next(new AppError("User ID is required", 400));

  const user = await updateUserStatus(userId, req.body);

  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

export const moderationQueueController = catchAsync(async (_req, res) => {
  const queue = await getModerationQueue();
  res.status(200).json({
    status: "success",
    data: queue,
  });
});

export const promoteUserToAdminController = catchAsync(async (req, res, next) => {
  const userId = req.params.id?.toString();
  if (!userId) return next(new AppError("User ID is required", 400));

  const { promoteUserToAdmin } = await import("../services/adminService");
  const user = await promoteUserToAdmin(userId);

  res.status(200).json({
    status: "success",
    message: "User promoted to admin successfully",
    data: {
      user: user.toPublicJSON(),
    },
  });
});
