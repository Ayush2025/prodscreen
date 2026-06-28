import { HardwareEvent } from "../models/HardwareEvent.js";
import { ProductionEntry } from "../models/ProductionEntry.js";
import { logger } from "../config/logger.js";

const toHourBucket = (value) => {
  const dt = new Date(value);
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const next = String((dt.getUTCHours() + 1) % 24).padStart(2, "0");
  return { start: `${hh}:00`, end: `${next}:00`, date: dt.toISOString().slice(0, 10) };
};

export const processHardwareEvents = async () => {
  const batch = await HardwareEvent.find({ processed: false }).sort({ timestamp: 1 }).limit(100);
  for (const event of batch) {
    try {
      const { start, end, date } = toHourBucket(event.timestamp);
      if (event.interpretedAs !== "part_in") {
        event.processed = true;
        await event.save();
        continue;
      }

      const quantity = Number(event.rawPayload?.quantity ?? 1);
      const processId = event.rawPayload?.processId || event.processId;
      if (!processId) {
        event.processed = true;
        await event.save();
        continue;
      }

      const existing = await ProductionEntry.findOne({
        factoryId: event.factoryId,
        processId,
        date,
        "hourBucket.start": start
      });

      if (existing) {
        const currentActual = Number(existing.values?.actual || 0);
        const target = Number(existing.values?.target || 0);
        existing.values = { ...(existing.values || {}), actual: currentActual + quantity, gap: target - (currentActual + quantity) };
        existing.source = "hardware";
        await existing.save();
      } else {
        await ProductionEntry.create({
          factoryId: event.factoryId,
          processId,
          shiftName: event.rawPayload?.shiftName || "Unassigned",
          date,
          hourBucket: { start, end },
          values: { target: 0, actual: quantity, gap: -quantity },
          source: "hardware",
          enteredBy: event.rawPayload?.enteredBy
        });
      }

      event.processed = true;
      await event.save();
    } catch (error) {
      logger.error({ err: error, eventId: event._id }, "Hardware event processing failed");
    }
  }
};

export const startHardwareProcessor = () => {
  const timer = setInterval(() => {
    processHardwareEvents().catch((error) => logger.error({ err: error }, "Hardware processor tick failed"));
  }, 5000);
  return timer;
};
