import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["numeric", "text", "dropdown", "time-range"],
      required: true
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] }
  },
  { _id: false }
);

const tableTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    columns: { type: [columnSchema], default: [] }
  },
  { timestamps: true }
);

export const TableTemplate = mongoose.model("TableTemplate", tableTemplateSchema);
