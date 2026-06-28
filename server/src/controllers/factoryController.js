import { StatusCodes } from "http-status-codes";
import { Factory } from "../models/Factory.js";
import { FactoryConfig } from "../models/FactoryConfig.js";
import { TableTemplate } from "../models/TableTemplate.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

export const listFactories = async (_req, res) => {
  const factories = await Factory.find({}).sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ factories });
};

export const createFactory = async (req, res) => {
  const factory = await Factory.create(req.body);
  return res.status(StatusCodes.CREATED).json({ factory });
};

export const getFactoryConfig = async (req, res) => {
  const config = await FactoryConfig.findOne({ factoryId: req.params.id });
  return res.status(StatusCodes.OK).json({ config });
};

export const cloneTemplateToFactory = async (req, res) => {
  const { id: factoryId, templateId } = req.params;
  const template = await TableTemplate.findById(templateId);
  if (!template) throw new ApiError(StatusCodes.NOT_FOUND, "Template not found");

  const clonedColumns = template.columns.map((col) => ({
    columnDefId: col.columnDefId,
    key: col.key,
    label: col.label,
    dataType: col.dataType,
    dropdownOptions: col.dropdownOptions || [],
    computeRule: col.computeRule || "",
    order: col.order,
    width: col.width
  }));

  const existing = await FactoryConfig.findOne({ factoryId });
  if (existing) {
    existing.sourceTemplateId = template._id;
    existing.columns = clonedColumns;
    await existing.save();
    return res.status(StatusCodes.OK).json({ config: existing });
  }

  const config = await FactoryConfig.create({
    factoryId,
    sourceTemplateId: template._id,
    columns: clonedColumns,
    processes: [],
    shifts: []
  });
  return res.status(StatusCodes.CREATED).json({ config });
};

export const patchFactoryConfig = async (req, res) => {
  const config = await FactoryConfig.findOne({ factoryId: req.params.id });
  if (!config) throw new ApiError(StatusCodes.NOT_FOUND, "Factory config not found");

  const { processes, shifts, columns } = req.body;
  if (processes) config.processes = processes;
  if (shifts) config.shifts = shifts;
  if (columns) config.columns = columns;
  await config.save();

  return res.status(StatusCodes.OK).json({ config });
};

export const listUsers = async (_req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
  return res.status(StatusCodes.OK).json({ users });
};
