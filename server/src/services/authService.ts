import jwt from "jsonwebtoken";
import User from "../models/User";
import config from "../config/env";
import AppError from "../utils/AppError";

function signToken(userId: string) {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function register(payload: {
  username: string;
  name?: string;
  email: string;
  password: string;
}) {
  const existingByEmail = await User.findOne({ email: payload.email });

  if (existingByEmail) {
    throw new AppError("email already in use", 409, { field: "email" });
  }

  const existingByUsername = await User.findOne({ username: payload.username });
  if (existingByUsername) {
    throw new AppError("username already in use", 409, { field: "username" });
  }

  const user = await User.create(payload);
  const token = signToken(user._id.toString());

  return { user, token };
}

export async function login(payload: { email: string; password: string }) {
  const user = await User.findOne({ email: payload.email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);

  const ok = await user.comparePassword(payload.password);
  if (!ok) throw new AppError("Invalid email or password", 401);

  const token = signToken(user._id.toString());
  return { user, token };
}

