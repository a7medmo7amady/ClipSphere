import catchAsync from "../utils/catchAsync";
import { getMe, updateMe, updateAvatarMetadata } from "../services/userService";
import AppError from "../utils/AppError";

export const getMeController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const user = await getMe(req.user._id.toString());
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

export const updateMeController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const user = await updateMe(req.user._id.toString(), req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

export const updateAvatarController = catchAsync(async (req, res, next) => {
  if (!req.user) return next(new AppError("Authentication required", 401));
  const user = await updateAvatarMetadata(req.user._id.toString(), req.body.objectName);
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

