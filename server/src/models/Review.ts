import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface IReview {
  rating: number;
  comment: string;
  user: Types.ObjectId;
  video: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<IReview>;

const reviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
      trim: true,
    },
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

// Prevent multiple reviews by the same user on the same video
reviewSchema.index({ user: 1, video: 1 }, { unique: true });

const Review = model<IReview>("Review", reviewSchema);

export default Review;

