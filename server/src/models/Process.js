import mongoose from "mongoose";

const processSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Process = mongoose.model("Process", processSchema);
