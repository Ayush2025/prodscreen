import mongoose from "mongoose";

const defectEntrySchema = new mongoose.Schema(
  {
    productionEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionEntry", required: true, index: true },
    defectCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "DefectCode", required: true },
    quantity: { type: Number, required: true, min: 1 },
    countermeasure: { type: String, default: "" },
    recovery: { type: String, default: "" }
  },
  { timestamps: true, versionKey: false }
);

export const DefectEntry = mongoose.model("DefectEntry", defectEntrySchema);
