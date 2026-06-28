import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const toAuthPayload = (user) => {
  const token = jwt.sign({ sub: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
  }

  const usersCount = await User.countDocuments({});
  const effectiveRole = usersCount === 0 ? "admin" : role || "operator";
  const passwordHash = await User.hashPassword(password);

  const user = await User.create({ name, email, passwordHash, role: effectiveRole });
  return res.status(StatusCodes.CREATED).json(toAuthPayload(user));
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

  return res.status(StatusCodes.OK).json(toAuthPayload(user));
};

export const me = async (req, res) => {
  return res.status(StatusCodes.OK).json({
    user: req.user
  });
};
