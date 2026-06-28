import mongoose from "mongoose";

const tableTemplateColumnSchema = new mongoose.Schema(
  {
    columnDefId: { type: mongoose.Schema.Types.ObjectId, ref: "ColumnDefinition", required: true },
    key: { type: String, required: true },
    label: { type: String, required: true },
    dataType: { type: String, enum: ["number", "text", "dropdown", "computed"], required: true },
    dropdownOptions: { type: [String], default: [] },
    computeRule: { type: String, default: "" },
    order: { type: Number, required: true },
    width: { type: Number, default: 140 }
  },
  { _id: false }
);

const tableTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    columns: { type: [tableTemplateColumnSchema], default: [] },
    includesHourByHour: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

export const TableTemplate = mongoose.model("TableTemplate", tableTemplateSchema);
