import { StatusCodes } from "http-status-codes";
import { DefectCode } from "../models/DefectCode.js";
import { DefectEntry } from "../models/DefectEntry.js";

export const listDefectCodes = async (req, res) => {
  const { factoryId } = req.query;
  const filter = factoryId ? { $or: [{ factoryId: null }, { factoryId }] } : { factoryId: null };
  const codes = await DefectCode.find(filter).sort({ code: 1 });
  return res.status(StatusCodes.OK).json({ codes });
};

export const createDefectCode = async (req, res) => {
  const code = await DefectCode.create(req.body);
  return res.status(StatusCodes.CREATED).json({ code });
};

export const createDefectEntry = async (req, res) => {
  const defect = await DefectEntry.create({
    productionEntryId: req.params.id,
    ...req.body
  });
  return res.status(StatusCodes.CREATED).json({ defect });
};
