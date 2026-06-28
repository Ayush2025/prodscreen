import mongoose from "mongoose";

const breakItemSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    duration_min: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const shiftSchema = new mongoose.Schema(
  {
    shiftName: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    lunch: {
      start: { type: String, default: "" },
      duration_min: { type: Number, default: 0, min: 0 }
    },
    breaks: { type: [breakItemSchema], default: [] }
  },
  { _id: false }
);

const processSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { _id: true }
);

const configColumnSchema = new mongoose.Schema(
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
  { _id: true }
);

const factoryConfigSchema = new mongoose.Schema(
  {
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true, unique: true },
    sourceTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: "TableTemplate", required: true },
    processes: { type: [processSchema], default: [] },
    shifts: {
      type: [shiftSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 3,
        message: "A factory config can contain at most 3 shifts"
      },
      default: []
    },
    columns: { type: [configColumnSchema], default: [] }
  },
  { timestamps: true, versionKey: false }
);

export const FactoryConfig = mongoose.model("FactoryConfig", factoryConfigSchema);
