import User from "../models/User";
import AppError from "../utils/AppError";

export async function getUserById(userId: string) {
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
      avatarKey: objectName,
    },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError("User not found", 404);
  return user;
}

export type PreferencesUpdate = {
  inApp?: { followers?: boolean; comments?: boolean; likes?: boolean; tips?: boolean };
  email?: { followers?: boolean; comments?: boolean; likes?: boolean; tips?: boolean };
};

export async function updatePreferences(userId: string, payload: PreferencesUpdate) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const prefs = user.notificationPreferences || {
    inApp: { followers: true, comments: true, likes: true, tips: true },
    email: { followers: false, comments: false, likes: false, tips: false },
  };

  if (payload.inApp) {
    prefs.inApp = { ...prefs.inApp, ...payload.inApp };
  }
  if (payload.email) {
    prefs.email = { ...prefs.email, ...payload.email };
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { notificationPreferences: prefs },
    { new: true, runValidators: true }
  );

  if (!updated) throw new AppError("User not found", 404);
  return updated;
}

