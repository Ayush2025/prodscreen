import mongoose from "mongoose";

const factorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    timezone: { type: String, required: true, default: "UTC" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

export const Factory = mongoose.model("Factory", factorySchema);
