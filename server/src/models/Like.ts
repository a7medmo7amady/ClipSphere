import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface ILike {
  user: Types.ObjectId;
  video: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type LikeDocument = HydratedDocument<ILike>;

const likeSchema = new Schema<ILike>(
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
  },
  { timestamps: true }
);

// Prevent a user from liking the same video multiple times
likeSchema.index({ user: 1, video: 1 }, { unique: true });

const Like = model<ILike>("Like", likeSchema);

export default Like;
