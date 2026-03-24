import WatchHistory from "../models/WatchHistory";
import Video from "../models/Video";
import AppError from "../utils/AppError";

type LogWatchPayload = {
  videoId: string;
  watchDuration: number;
  completed: boolean;
};

export async function logWatch(userId: string, payload: LogWatchPayload) {
  const video = await Video.findById(payload.videoId);
  if (!video || video.status !== "public") {
    throw new AppError("Video not found", 404);
  }

  const safeDuration = Math.min(payload.watchDuration, video.duration);

  const history = await WatchHistory.create({
    user: userId,
    video: payload.videoId,
    watchDuration: safeDuration,
    completed: payload.completed,
  });

  return history;
}
