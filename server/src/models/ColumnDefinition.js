import mongoose from "mongoose";

const columnDefinitionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    dataType: {
      type: String,
      enum: ["number", "text", "dropdown", "computed"],
      required: true
    },
    dropdownOptions: { type: [String], default: [] },
    computeRule: { type: String, default: "" },
    isSystem: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

export const ColumnDefinition = mongoose.model("ColumnDefinition", columnDefinitionSchema);
