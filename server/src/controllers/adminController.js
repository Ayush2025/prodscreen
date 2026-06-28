import { StatusCodes } from "http-status-codes";
import { Process } from "../models/Process.js";
import { ShiftConfig } from "../models/ShiftConfig.js";
import { TableTemplate } from "../models/TableTemplate.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const listProcesses = async (_req, res) => {
  const processes = await Process.find({}).sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ processes });
};

export const createProcess = async (req, res) => {
  const process = await Process.create(req.body);
  return res.status(StatusCodes.CREATED).json({ process });
};

export const updateProcess = async (req, res) => {
  const process = await Process.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!process) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Process not found");
  }
  return res.status(StatusCodes.OK).json({ process });
};

export const upsertShiftConfig = async (req, res) => {
  const existing = await ShiftConfig.findOne({});
  if (!existing) {
    const config = await ShiftConfig.create(req.body);
    return res.status(StatusCodes.CREATED).json({ shiftConfig: config });
  }
  existing.shifts = req.body.shifts;
  await existing.save();
  return res.status(StatusCodes.OK).json({ shiftConfig: existing });
};

export const getShiftConfig = async (_req, res) => {
  const config = await ShiftConfig.findOne({});
  return res.status(StatusCodes.OK).json({ shiftConfig: config });
};

export const upsertTemplate = async (req, res) => {
  const { name, columns } = req.body;
  const template = await TableTemplate.findOneAndUpdate(
    { name },
    { columns },
    { new: true, upsert: true, runValidators: true }
  );
  return res.status(StatusCodes.OK).json({ template });
};

export const listTemplates = async (_req, res) => {
  const templates = await TableTemplate.find({}).sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ templates });
};

export const listUsers = async (_req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ users });
};

export const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).select("-passwordHash");
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  return res.status(StatusCodes.OK).json({ user });
};
