import mongoose from "mongoose";

const hardwareEventSchema = new mongoose.Schema(
  {
    processId: { type: mongoose.Schema.Types.ObjectId, ref: "Process" },
    sourceType: {
      type: String,
      enum: ["barcode", "rfid", "camera", "photoeye", "sensor"],
      required: true
    },
    eventType: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    capturedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const HardwareEvent = mongoose.model("HardwareEvent", hardwareEventSchema);
