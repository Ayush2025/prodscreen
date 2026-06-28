import { StatusCodes } from "http-status-codes";
import { ProductionRecord } from "../models/ProductionRecord.js";
import { buildSummary, generateClaudeInsights } from "../services/analyticsService.js";

export const getSummary = async (req, res) => {
  const { processId, dateFrom, dateTo } = req.query;
  const filter = {};
  if (processId) filter.processId = processId;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = dateFrom;
    if (dateTo) filter.date.$lte = dateTo;
  }

  const records = await ProductionRecord.find(filter).sort({ date: 1 });
  const summary = buildSummary(records);

  return res.status(StatusCodes.OK).json({ summary });
};

export const getInsights = async (req, res) => {
  const { processId, dateFrom, dateTo } = req.query;
  const filter = {};
  if (processId) filter.processId = processId;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = dateFrom;
    if (dateTo) filter.date.$lte = dateTo;
  }

  const records = await ProductionRecord.find(filter).sort({ date: 1 });
  const summary = buildSummary(records);
  const insights = await generateClaudeInsights(summary);

  return res.status(StatusCodes.OK).json({ summary, insights });
};
