const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/env");
const AppError = require("../utils/AppError");

function signToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("email already in use", 409, { field: "email" });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());

  return { user, token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id.toString());
  return { user, token };
}

module.exports = {
  register,
  login,
  signToken,
};

