import catchAsync from "../utils/catchAsync";
import { register, login, verifyEmail } from "../services/authService";

export const registerController = catchAsync(async (req, res) => {
  const { user } = await register(req.body);
  res.status(201).json({
    status: "success",
    message: "Account created. Please check your email to verify your account.",
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

export const verifyEmailController = catchAsync(async (req, res) => {
  const { email, code } = req.body as { email: string; code: string };
  const { user, token } = await verifyEmail(email, code);
  res.status(200).json({
    status: "success",
    message: "Email verified successfully.",
    token,
    data: {
      user: user.toPublicJSON(),
    },
  });
});
