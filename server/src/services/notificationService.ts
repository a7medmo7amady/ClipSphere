import Notification, { type NotificationType } from "../models/Notification";
import { getIO } from "../config/socket";

export async function createNotification({
  recipientId,
  actorId,
  type,
  message,
  link,
}: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  message: string;
  link: string;
}) {
  // Don't notify yourself
  if (recipientId === actorId) return;
  const notif = await Notification.create({ recipient: recipientId, actor: actorId, type, message, link });

  try {
    getIO().to(`user:${recipientId}`).emit("notification", {
      _id: notif._id,
      type: notif.type,
      message: notif.message,
      link: notif.link,
      read: false,
      createdAt: notif.createdAt,
    });
  } catch {
    // Socket.IO not available (e.g. during tests)
  }
}

export async function getNotifications(userId: string) {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("actor", "username name avatarKey");
}

export async function markAsRead(notificationId: string, userId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
}

export async function markAllAsRead(userId: string) {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
}

export async function getUnreadCount(userId: string) {
  return Notification.countDocuments({ recipient: userId, read: false });
}
