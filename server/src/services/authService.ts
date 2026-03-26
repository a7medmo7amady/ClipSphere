import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import config from "../config/env";
import AppError from "../utils/AppError";
import { MailService, verificationEmailTemplate } from "../utils/email";

const mailService = new MailService();

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

  const verificationToken = String(Math.floor(100000 + Math.random() * 900000)); 
  const verificationTokenExpires = new Date(
    Date.now() + config.verificationCodeExpiresInMinutes * 60 * 1000
  );

  const user = await User.create({
    ...payload,
    verificationToken,
    verificationTokenExpires,
  });

  mailService.send({
    to: user.email,
    subject: "Your ClipSphere verification code",
    message: verificationEmailTemplate(user.name ?? user.username, verificationToken),
  });

  return { user };
}

export async function verifyEmail(email: string, code: string) {
  const user = await User.findOne({ email }).select(
    "+verificationToken +verificationTokenExpires"
  );

  if (!user || user.verificationToken !== code) {
    throw new AppError("Invalid verification code", 400);
  }
  if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    throw new AppError("Verification code has expired", 400);
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  const authToken = signToken(user._id.toString());
  return { user, token: authToken };
}

export async function login(payload: { email: string; password: string }) {
  const user = await User.findOne({ email: payload.email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);

  const ok = await user.comparePassword(payload.password);
  if (!ok) throw new AppError("Invalid email or password", 401);

  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const token = signToken(user._id.toString());
  return { user, token };
}
