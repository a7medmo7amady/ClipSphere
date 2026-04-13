import mongoose from "mongoose";
import Follower from "../models/Follower";
import User, { type PublicUser, type UserDocument } from "../models/User";
import AppError from "../utils/AppError";

/** Follow target user. Rejects self-follow (and model pre-save hook also enforces). */
export async function follow(
  currentUserId: string,
  targetUserId: string
): Promise<{ message: string }> {
  if (currentUserId === targetUserId) {
    throw new AppError("You cannot follow yourself", 409);
  }

  const target = await User.findById(targetUserId);
  if (!target) throw new AppError("User not found", 404);

  const fid = new mongoose.Types.ObjectId(currentUserId);
  const tid = new mongoose.Types.ObjectId(targetUserId);

  await Follower.findOneAndUpdate(
    { followerId: fid, followingId: tid },
    { followerId: fid, followingId: tid },
    { upsert: true, new: true }
  );

  return { message: "Followed successfully" };
}

/** Unfollow target user. */
export async function unfollow(
  currentUserId: string,
  targetUserId: string
): Promise<{ message: string }> {
  const fid = new mongoose.Types.ObjectId(currentUserId);
  const tid = new mongoose.Types.ObjectId(targetUserId);

  const deleted = await Follower.findOneAndDelete({
    followerId: fid,
    followingId: tid,
  });

  if (!deleted) {
    throw new AppError("You are not following this user", 404);
  }

  return { message: "Unfollowed successfully" };
}

/** List users that follow the given account (followers of :id). Public. */
export async function getFollowers(userId: string): Promise<PublicUser[]> {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const docs = await Follower.find({ followingId: userId }).populate("followerId");
  const users = docs
    .map((d) => d.followerId)
    .filter((u) => u != null && typeof (u as unknown as { toPublicJSON?: () => PublicUser }).toPublicJSON === "function");
  return users.map((u) => (u as unknown as UserDocument).toPublicJSON());
}

/** List users that this account follows (following of :id). Public. */
export async function getFollowing(userId: string): Promise<PublicUser[]> {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const docs = await Follower.find({ followerId: userId }).populate("followingId");
  const users = docs
    .map((d) => d.followingId)
    .filter((u) => u != null && typeof (u as unknown as { toPublicJSON?: () => PublicUser }).toPublicJSON === "function");
  return users.map((u) => (u as unknown as UserDocument).toPublicJSON());
}
