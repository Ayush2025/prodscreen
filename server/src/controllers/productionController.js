import { StatusCodes } from "http-status-codes";
import { ProductionRecord } from "../models/ProductionRecord.js";
import { ApiError } from "../utils/ApiError.js";
import { pushToKpiPlus } from "../services/integrationService.js";

const deriveTotals = (rows) => {
  const target = rows.reduce((acc, row) => acc + Number(row.target || 0), 0);
  const actual = rows.reduce((acc, row) => acc + Number(row.actual || 0), 0);
  return {
    target,
    actual,
    gap: actual - target
  };
};

export const upsertRecord = async (req, res) => {
  const { processId, date, shiftName, rows } = req.body;
  const totals = deriveTotals(rows);

  let record = await ProductionRecord.findOne({ processId, date, shiftName });

  if (!record) {
    record = await ProductionRecord.create({
      processId,
      date,
      shiftName,
      rows,
      totals,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
  } else {
    record.rows = rows;
    record.totals = totals;
    record.updatedBy = req.user._id;
    await record.save();
  }

  const sync = await pushToKpiPlus(record.toObject());

  return res.status(StatusCodes.OK).json({ record, sync });
};

export const getRecord = async (req, res) => {
  const { processId, date, shiftName } = req.query;
  const record = await ProductionRecord.findOne({ processId, date, shiftName }).populate("processId");
  return res.status(StatusCodes.OK).json({ record });
};

export const listRecords = async (req, res) => {
  const { processId, dateFrom, dateTo } = req.query;
  const filter = {};
  if (processId) filter.processId = processId;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = dateFrom;
    if (dateTo) filter.date.$lte = dateTo;
  }

  const records = await ProductionRecord.find(filter).populate("processId").sort({ date: -1 });
  return res.status(StatusCodes.OK).json({ records });
};

export const deleteRecord = async (req, res) => {
  const record = await ProductionRecord.findByIdAndDelete(req.params.id);
  if (!record) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Record not found");
  }
  return res.status(StatusCodes.OK).json({ message: "Record deleted" });
};
