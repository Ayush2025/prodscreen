import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.JWT_COOKIE_NAME];
    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Missing authentication cookie");
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token user");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication failed"));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Insufficient permission"));
  }
  return next();
};
