import mongoose from "mongoose";

const hardwareEventSchema = new mongoose.Schema(
  {
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true, index: true },
    processId: { type: mongoose.Schema.Types.ObjectId, required: false },
    cellId: { type: String, required: true },
    deviceType: {
      type: String,
      enum: ["barcode", "rfid", "camera", "photoeye", "sensor"],
      required: true
    },
    rawPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
    interpretedAs: {
      type: String,
      enum: ["part_in", "part_out", "defect_flag", "unknown"],
      required: true
    },
    timestamp: { type: Date, required: true, default: Date.now },
    processed: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

export const HardwareEvent = mongoose.model("HardwareEvent", hardwareEventSchema);
