import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ProductionEntry } from "../models/ProductionEntry.js";
import { DefectEntry } from "../models/DefectEntry.js";
import { DefectCode } from "../models/DefectCode.js";
import { buildSummaryMetrics, generateGroqInsights } from "../services/analyticsService.js";

export const queryAnalytics = async (req, res) => {
  const { factoryId, dateRange, processIds = [] } = req.body;
  const match = {
    factoryId: new mongoose.Types.ObjectId(factoryId)
  };
  if (dateRange?.from || dateRange?.to) {
    match.date = {};
    if (dateRange.from) match.date.$gte = dateRange.from;
    if (dateRange.to) match.date.$lte = dateRange.to;
  }
  if (processIds.length > 0) {
    match.processId = { $in: processIds.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  const totalsAgg = await ProductionEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        target: { $sum: "$values.target" },
        actual: { $sum: "$values.actual" },
        gap: { $sum: "$values.gap" }
      }
    }
  ]);

  const byProcess = await ProductionEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$processId",
        target: { $sum: "$values.target" },
        actual: { $sum: "$values.actual" },
        gap: { $sum: "$values.gap" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const trend = await ProductionEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$date",
        target: { $sum: "$values.target" },
        actual: { $sum: "$values.actual" },
        gap: { $sum: "$values.gap" }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", target: 1, actual: 1, gap: 1 } }
  ]);

  const entryIds = await ProductionEntry.find(match).select("_id");
  const defectsByCategory = await DefectEntry.aggregate([
    { $match: { productionEntryId: { $in: entryIds.map((e) => e._id) } } },
    {
      $lookup: {
        from: DefectCode.collection.name,
        localField: "defectCodeId",
        foreignField: "_id",
        as: "code"
      }
    },
    { $unwind: "$code" },
    { $group: { _id: "$code.category", quantity: { $sum: "$quantity" } } },
    { $project: { _id: 0, category: "$_id", quantity: 1 } }
  ]);

  const summary = buildSummaryMetrics({
    totals: totalsAgg[0] || { target: 0, actual: 0, gap: 0 },
    byProcess: byProcess.map((item) => ({
      processId: item._id,
      target: item.target,
      actual: item.actual,
      gap: item.gap
    })),
    trend,
    defectsByCategory
  });

  if (summary.totalTarget === 0 && summary.totalActual === 0 && summary.trend.length === 0) {
    return res.status(StatusCodes.OK).json({ summary, insights: null, empty: true });
  }

  try {
    const insights = await generateGroqInsights(summary);
    return res.status(StatusCodes.OK).json({ summary, insights, aiError: null });
  } catch (error) {
    return res.status(StatusCodes.OK).json({
      summary,
      insights: null,
      aiError: error.message
    });
  }
};
