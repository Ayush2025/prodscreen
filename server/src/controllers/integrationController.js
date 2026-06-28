import { StatusCodes } from "http-status-codes";
import { HardwareEvent } from "../models/HardwareEvent.js";

export const ingestHardwareEvent = async (req, res) => {
  const event = await HardwareEvent.create(req.body);
  return res.status(StatusCodes.CREATED).json({ event });
};

export const listHardwareEvents = async (req, res) => {
  const { processId, sourceType } = req.query;
  const filter = {};
  if (processId) filter.processId = processId;
  if (sourceType) filter.sourceType = sourceType;
  const events = await HardwareEvent.find(filter).sort({ createdAt: -1 }).limit(200);
  return res.status(StatusCodes.OK).json({ events });
};
