import mongoose, { type HydratedDocument } from "mongoose";

export interface ITip {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  amount: number;
  stripeSessionId?: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export type TipDocument = HydratedDocument<ITip>;

const tipSchema = new mongoose.Schema<ITip>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    stripeSessionId: {
      type: String,
      select: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

tipSchema.index({ sender: 1, createdAt: -1 });
tipSchema.index({ recipient: 1, createdAt: -1 });

const Tip = mongoose.model<ITip>("Tip", tipSchema);

export default Tip;
