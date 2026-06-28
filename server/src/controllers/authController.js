import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const setAuthCookie = (res, token) => {
  res.cookie(env.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 12
  });
};

const createToken = (user) => {
  return jwt.sign({ sub: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const toUserPayload = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    factoryIds: user.factoryIds || []
  };
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const valid = await user.verifyPassword(password);
  if (!valid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const token = createToken(user);
  setAuthCookie(res, token);
  return res.status(StatusCodes.OK).json({ user: toUserPayload(user) });
};

export const logout = async (_req, res) => {
  res.clearCookie(env.JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax"
  });
  return res.status(StatusCodes.OK).json({ message: "Logged out" });
};

export const me = async (req, res) => {
  return res.status(StatusCodes.OK).json({
    user: toUserPayload(req.user)
  });
};

export const createSessionPayload = (user) => {
  const token = jwt.sign({ sub: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
  return {
    token,
    user: toUserPayload(user)
  };
};
