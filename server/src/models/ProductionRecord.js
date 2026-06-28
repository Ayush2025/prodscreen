import mongoose from "mongoose";

const rowSchema = new mongoose.Schema(
  {
    timeRange: { type: String, required: true },
    target: { type: Number, default: 0 },
    actual: { type: Number, default: 0 },
    gap: { type: Number, default: 0 },
    qualityDefects: { type: Number, default: 0 },
    scrap: { type: Number, default: 0 },
    comments: { type: String, default: "" },
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const productionRecordSchema = new mongoose.Schema(
  {
    processId: { type: mongoose.Schema.Types.ObjectId, ref: "Process", required: true, index: true },
    date: { type: String, required: true, index: true },
    shiftName: { type: String, required: true },
    rows: { type: [rowSchema], default: [] },
    totals: {
      target: { type: Number, default: 0 },
      actual: { type: Number, default: 0 },
      gap: { type: Number, default: 0 }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

productionRecordSchema.index({ processId: 1, date: 1, shiftName: 1 }, { unique: true });

export const ProductionRecord = mongoose.model("ProductionRecord", productionRecordSchema);
