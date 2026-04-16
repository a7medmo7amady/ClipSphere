import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../services/notificationService";

export const getNotificationsController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const notifications = await getNotifications(req.user._id.toString());
  res.status(200).json({ status: "success", data: { notifications } });
});

export const getUnreadCountController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const count = await getUnreadCount(req.user._id.toString());
  res.status(200).json({ status: "success", data: { count } });
});

export const markAsReadController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const notification = await markAsRead(id, req.user._id.toString());
  if (!notification) return next(new AppError("Notification not found", 404));
  res.status(200).json({ status: "success", data: { notification } });
});

export const markAllAsReadController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  await markAllAsRead(req.user._id.toString());
  res.status(200).json({ status: "success", message: "All notifications marked as read." });
});
