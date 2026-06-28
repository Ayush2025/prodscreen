import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const createUser = async (req, res) => {
  const { name, email, password, role, factoryIds = [] } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(StatusCodes.CONFLICT, "Email already exists");

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    factoryIds
  });
  return res.status(StatusCodes.CREATED).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      factoryIds: user.factoryIds
    }
  });
};
