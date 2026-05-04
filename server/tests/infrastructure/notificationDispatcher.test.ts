import { notifyVideoReview, notifyNewFollower } from "../../src/infrastructure/notificationDispatcher";
import User from "../../src/models/User";
import { sendToUser } from "../../src/infrastructure/websocket";
import { sendMail } from "../../src/infrastructure/mail";

// Mock dependencies
jest.mock("../../src/models/User");
jest.mock("../../src/infrastructure/websocket");
jest.mock("../../src/infrastructure/mail");

describe("Notification Dispatcher", () => {
  const mockUser = {
    _id: "user-123",
    email: "user@example.com",
    notificationPreferences: {
      inApp: {
        followers: true,
        comments: true,
      },
      email: {
        followers: false,
        comments: true,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("notifyVideoReview", () => {
    it("should dispatch via both websocket and email when both are enabled", async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const params = {
        ownerId: "user-123",
        reviewer: { username: "reviewer1" },
        video: { id: "video-1", title: "Video Title" },
      };

      await notifyVideoReview(params);

      // Verify WebSocket call
      expect(sendToUser).toHaveBeenCalledWith("user-123", "notification", expect.objectContaining({
        type: "NEW_REVIEW",
        videoId: "video-1",
      }));

      // Verify Email call
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: "user@example.com",
        subject: expect.stringContaining("Video Title"),
      }));
    });

    it("should only dispatch via websocket when email is disabled", async () => {
      const userWithDisabledEmail = {
        ...mockUser,
        notificationPreferences: {
          ...mockUser.notificationPreferences,
          email: { followers: false, comments: false },
        },
      };
      (User.findById as jest.Mock).mockResolvedValue(userWithDisabledEmail);

      await notifyVideoReview({
        ownerId: "user-123",
        reviewer: { username: "reviewer1" },
        video: { id: "video-1", title: "Title" },
      });

      expect(sendToUser).toHaveBeenCalled();
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe("notifyNewFollower", () => {
    it("should respect follower-specific preferences", async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await notifyNewFollower({
        userId: "user-123",
        follower: { username: "follower1" },
      });

      // WebSocket should be called (prefs.inApp.followers = true)
      expect(sendToUser).toHaveBeenCalled();
      // Email should NOT be called (prefs.email.followers = false)
      expect(sendMail).not.toHaveBeenCalled();
    });
  });
});
