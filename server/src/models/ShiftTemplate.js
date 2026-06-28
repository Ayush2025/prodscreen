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

const shiftTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    shifts: {
      type: [shiftSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.length <= 3,
        message: "A shift template must contain 1 to 3 shifts"
      }
    }
  },
  { timestamps: true, versionKey: false }
);

export const ShiftTemplate = mongoose.model("ShiftTemplate", shiftTemplateSchema);
