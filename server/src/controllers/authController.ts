import catchAsync from "../utils/catchAsync";
import { register, login } from "../services/authService";

export const registerController = catchAsync(async (req, res) => {
  const { user, token } = await register(req.body);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: user.toPublicJSON(),
    },
  });
});

export const loginController = catchAsync(async (req, res) => {
  const { user, token } = await login(req.body);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: user.toPublicJSON(),
    },
  });
});

