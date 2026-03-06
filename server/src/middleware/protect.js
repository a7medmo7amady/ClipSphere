const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
}

const protect = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (e) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await User.findById(payload.id);
  if (!user) {
    return next(new AppError("User not found", 401));
  }

  req.user = user;
  return next();
});

module.exports = protect;

