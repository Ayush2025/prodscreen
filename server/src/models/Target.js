import mongoose from "mongoose";

const targetSchema = new mongoose.Schema(
  {
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true, index: true },
    processId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    date: { type: String, required: true, index: true },
    hourBucket: {
      start: { type: String, required: true },
      end: { type: String, required: true }
    },
    targetValue: { type: Number, required: true, min: 0 },
    source: { type: String, enum: ["manual", "erp"], default: "manual" }
  },
  { timestamps: true, versionKey: false }
);

targetSchema.index(
  { factoryId: 1, processId: 1, date: 1, "hourBucket.start": 1 },
  { unique: true }
);

export const Target = mongoose.model("Target", targetSchema);
