import mongoose from "mongoose";

const productionEntrySchema = new mongoose.Schema(
  {
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true, index: true },
    processId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    shiftName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    hourBucket: {
      start: { type: String, required: true },
      end: { type: String, required: true }
    },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
    source: { type: String, enum: ["manual", "hardware", "erp_sync"], default: "manual" },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, versionKey: false }
);

productionEntrySchema.index(
  { factoryId: 1, processId: 1, date: 1, "hourBucket.start": 1 },
  { unique: true }
);

export const ProductionEntry = mongoose.model("ProductionEntry", productionEntrySchema);
