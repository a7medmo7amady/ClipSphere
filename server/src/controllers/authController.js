const catchAsync = require("../utils/catchAsync");
const authService = require("../services/authService");

exports.register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: user.toPublicJSON(),
    },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: user.toPublicJSON(),
    },
  });
});

