import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface IVideo {
  title: string;
  description: string;
  owner: Types.ObjectId;
  videoURL: string;
  duration: number;
  viewsCount: number;
  status: "public" | "private" | "flagged";
  createdAt: Date;
  updatedAt: Date;
}

export type VideoDocument = HydratedDocument<IVideo>;

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videoURL: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["public", "private", "flagged"],
      default: "public",
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ owner: 1, createdAt: -1 });

const Video = model<IVideo>("Video", videoSchema);

export default Video;

