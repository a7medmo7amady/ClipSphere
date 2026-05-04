import User from "../models/User";
import { sendToUser } from "./websocket";
import { sendMail } from "./mail";
import config from "../config/env";

interface NotifyReviewParams {
  ownerId: string;
  reviewer: { username: string };
  video: { id: string; title: string };
}

interface NotifyFollowParams {
  userId: string;
  follower: { username: string };
}

export const notifyVideoReview = async ({ ownerId, reviewer, video }: NotifyReviewParams) => {
  try {
    const owner = await User.findById(ownerId);
    if (!owner) return;

    const prefs = owner.notificationPreferences;
    const title = "New Video Review";
    const content = `<strong>${reviewer.username}</strong> left a new review on your video <strong>"${video.title}"</strong>.`;

    // WebSocket Notification
    if (prefs.inApp.comments) {
      sendToUser(ownerId, "notification", {
        type: "NEW_REVIEW",
        title,
        message: `${reviewer.username} reviewed your video "${video.title}"`,
        videoId: video.id,
      });
    }

    // Email Notification
    if (prefs.email.comments) {
      await sendMail({
        to: owner.email,
        subject: `New review on "${video.title}"`,
        title,
        content: `
          <p>${content}</p>
          <p style="margin-top: 20px;">
            <a href="${config.clientUrl}/videos/${video.id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Video</a>
          </p>
        `,
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Notification Dispatch Error (Review):", error);
  }
};

export const notifyNewFollower = async ({ userId, follower }: NotifyFollowParams) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const prefs = user.notificationPreferences;
    const title = "New Follower";
    const content = `<strong>${follower.username}</strong> is now following you!`;

    // WebSocket Notification
    if (prefs.inApp.followers) {
      sendToUser(userId, "notification", {
        type: "NEW_FOLLOWER",
        title,
        message: `${follower.username} started following you`,
      });
    }

    // Email Notification
    if (prefs.email.followers) {
      await sendMail({
        to: user.email,
        subject: "You have a new follower!",
        title,
        content: `
          <p>${content}</p>
          <p style="margin-top: 20px;">
            <a href="${config.clientUrl}/profile/${follower.username}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
          </p>
        `,
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Notification Dispatch Error (Follow):", error);
  }
};
