import { Schema, model, Types, type HydratedDocument } from "mongoose";

export type NotificationType = "follow" | "review";

export interface INotification {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: NotificationType;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    type:      { type: String, enum: ["follow", "review"], required: true },
    message:   { type: String, required: true },
    link:      { type: String, required: true },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model<INotification>("Notification", notificationSchema);
export default Notification;
