import User from "../models/User";
import AppError from "../utils/AppError";

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateMe(userId: string, updates: { name?: string; bio?: string }) {
  const allowed: Record<string, unknown> = {
    name: updates.name,
    bio: updates.bio,
  };

  Object.keys(allowed).forEach((key) => {
    if (allowed[key] === undefined) delete allowed[key];
  });

  const user = await User.findByIdAndUpdate(userId, allowed, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateAvatarMetadata(userId: string, objectName: string) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      avatar: {
        objectName,
        updatedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError("User not found", 404);
  return user;
}

