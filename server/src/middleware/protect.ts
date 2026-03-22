import jwt from "jsonwebtoken";
import type { Request } from "express";
import config from "../config/env";
import User from "../models/User";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

function extractToken(req: Request) {
  const header = req.headers.authorization?.trim();
  if (!header) return null;

  const parts = header.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts[0].toLowerCase() !== "bearer") {
    return null;
  }

  let token = parts.slice(1).join(" ").trim();

  while (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }

  return token || null;
}

type JwtPayload = {
  id: string;
  iat: number;
  exp: number;
};

const protect = catchAsync(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(new AppError("Authentication required", 401));

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await User.findById(payload.id);
  if (!user) return next(new AppError("User not found", 401));

  req.user = user;
  return next();
});

export default protect;

