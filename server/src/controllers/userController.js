const catchAsync = require("../utils/catchAsync");
const userService = require("../services/userService");

exports.getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user._id);
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

exports.updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateMe(req.user._id, req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

exports.updateAvatar = catchAsync(async (req, res) => {
  const user = await userService.updateAvatarMetadata(req.user._id, req.body.objectName);
  res.status(200).json({
    status: "success",
    data: {
      user: user.toPublicJSON(),
    },
  });
});

