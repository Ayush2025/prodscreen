import { StatusCodes } from "http-status-codes";
import { FactoryConfig } from "../models/FactoryConfig.js";
import { ProductionEntry } from "../models/ProductionEntry.js";
import { Target } from "../models/Target.js";
import { ApiError } from "../utils/ApiError.js";
import { generateHourBuckets } from "../utils/shiftEngine.js";

const computeGap = (values) => {
  const target = Number(values.target ?? 0);
  const actual = Number(values.actual ?? 0);
  return {
    ...values,
    target,
    actual,
    gap: target - actual
  };
};

export const getFactoryEntries = async (req, res) => {
  const { id: factoryId } = req.params;
  const { processId, date, shiftName } = req.query;
  const config = await FactoryConfig.findOne({ factoryId });
  if (!config) throw new ApiError(StatusCodes.NOT_FOUND, "Factory config not found");

  const shift = config.shifts.find((item) => item.shiftName === shiftName);
  if (!shift) throw new ApiError(StatusCodes.BAD_REQUEST, "Shift not configured for factory");

  const buckets = generateHourBuckets(shift);
  const entries = await ProductionEntry.find({
    factoryId,
    processId,
    date,
    shiftName
  }).sort({ "hourBucket.start": 1 });

  const byStart = new Map(entries.map((entry) => [entry.hourBucket.start, entry]));
  const targets = await Target.find({ factoryId, processId, date });
  const targetByStart = new Map(targets.map((target) => [target.hourBucket.start, target.targetValue]));

  const merged = buckets.map((bucket) => {
    const existing = byStart.get(bucket.start);
    if (existing) return existing;
    return {
      _id: null,
      factoryId,
      processId,
      shiftName,
      date,
      hourBucket: { start: bucket.start, end: bucket.end },
      values: computeGap({ target: targetByStart.get(bucket.start) || 0, actual: 0 }),
      source: "manual",
      availableMinutes: bucket.availableMinutes,
      isBreakOverlap: bucket.isBreakOverlap
    };
  });

  return res.status(StatusCodes.OK).json({ columns: config.columns, entries: merged });
};

export const upsertFactoryEntry = async (req, res) => {
  const { id: factoryId } = req.params;
  const { processId, shiftName, date, hourBucket, values, source = "manual" } = req.body;
  const preparedValues = computeGap(values || {});

  const entry = await ProductionEntry.findOneAndUpdate(
    { factoryId, processId, date, "hourBucket.start": hourBucket.start },
    {
      factoryId,
      processId,
      shiftName,
      date,
      hourBucket,
      values: preparedValues,
      source,
      enteredBy: req.user._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(StatusCodes.OK).json({ entry });
};

export const patchEntry = async (req, res) => {
  const entry = await ProductionEntry.findById(req.params.id);
  if (!entry) throw new ApiError(StatusCodes.NOT_FOUND, "Entry not found");

  entry.values = computeGap({ ...(entry.values || {}), ...(req.body.values || {}) });
  if (req.body.source) entry.source = req.body.source;
  entry.enteredBy = req.user._id;
  await entry.save();

  return res.status(StatusCodes.OK).json({ entry });
};
