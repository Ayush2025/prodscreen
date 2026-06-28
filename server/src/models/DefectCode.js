import mongoose from "mongoose";

const defectCodeSchema = new mongoose.Schema(
  {
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", default: null, index: true },
    code: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["quality", "delivery", "people", "machine", "material"],
      required: true
    },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

defectCodeSchema.index({ factoryId: 1, code: 1 }, { unique: true });

export const DefectCode = mongoose.model("DefectCode", defectCodeSchema);
