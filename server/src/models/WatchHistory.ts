import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface IWatchHistory {
  user: Types.ObjectId;
  video: Types.ObjectId;
  watchedAt: Date;
  watchDuration: number;
  completed: boolean;
  liked?: boolean;
}

export type WatchHistoryDocument = HydratedDocument<IWatchHistory>;

const watchHistorySchema = new Schema<IWatchHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
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
    liked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false }
);


const WatchHistory = model<IWatchHistory>("WatchHistory", watchHistorySchema);

export default WatchHistory;
