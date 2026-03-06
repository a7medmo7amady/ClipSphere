const User = require("../models/User");
const AppError = require("../utils/AppError");

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
}

async function updateMe(userId, updates) {
  // Only allow safe profile fields to be updated here.
  const allowed = {
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

async function updateAvatarMetadata(userId, objectName) {
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

module.exports = {
  getMe,
  updateMe,
  updateAvatarMetadata,
};

