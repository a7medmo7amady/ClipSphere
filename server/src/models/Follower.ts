import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface IFollower {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type FollowerDocument = HydratedDocument<IFollower>;

const followerSchema = new Schema<IFollower>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// One relationship per follower/following pair
followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Prevent a user from following themselves
followerSchema.pre("save", function preventSelfFollow(this: FollowerDocument) {
  if (this.followerId.equals(this.followingId)) {
    throw new Error("User cannot follow themselves");
  }
});

const Follower = model<IFollower>("Follower", followerSchema);

export default Follower;

