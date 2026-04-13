import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface IWatchHistory {
  user: Types.ObjectId;
  video: Types.ObjectId;
  watchedAt: Date;
  watchDuration: number;
  completed: boolean;
}

export type WatchHistoryDocument = HydratedDocument<IWatchHistory>;

const watchHistorySchema = new Schema<IWatchHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
    watchDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    completed: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: false }
);

watchHistorySchema.index({ user: 1, watchedAt: -1 });
watchHistorySchema.index({ video: 1 });

// Optional but useful for deduping exact duplicate event writes.
watchHistorySchema.index({ user: 1, video: 1 });

const WatchHistory = model<IWatchHistory>("WatchHistory", watchHistorySchema);

export default WatchHistory;
