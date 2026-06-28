import { StatusCodes } from "http-status-codes";
import { TableTemplate } from "../models/TableTemplate.js";
import { ShiftTemplate } from "../models/ShiftTemplate.js";
import { ColumnDefinition } from "../models/ColumnDefinition.js";

export const listTableTemplates = async (_req, res) => {
  const templates = await TableTemplate.find({ isPublished: true }).sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ templates });
};

export const createTableTemplate = async (req, res) => {
  const template = await TableTemplate.create({
    ...req.body,
    createdBy: req.user._id
  });
  return res.status(StatusCodes.CREATED).json({ template });
};

export const listShiftTemplates = async (_req, res) => {
  const templates = await ShiftTemplate.find({}).sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ templates });
};

export const createShiftTemplate = async (req, res) => {
  const template = await ShiftTemplate.create(req.body);
  return res.status(StatusCodes.CREATED).json({ template });
};

export const listColumnDefinitions = async (_req, res) => {
  const columns = await ColumnDefinition.find({}).sort({ isSystem: -1, key: 1 });
  return res.status(StatusCodes.OK).json({ columns });
};

export const createColumnDefinition = async (req, res) => {
  const column = await ColumnDefinition.create(req.body);
  return res.status(StatusCodes.CREATED).json({ column });
};
