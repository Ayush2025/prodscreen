import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  { _id: false }
);

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    lunch: breakSchema,
    breaks: { type: [breakSchema], default: [] }
  },
  { _id: false }
);

const shiftConfigSchema = new mongoose.Schema(
  {
    shifts: {
      type: [shiftSchema],
      validate: {
        validator: (val) => val.length > 0 && val.length <= 3,
        message: "Shift count must be between 1 and 3"
      }
    }
  },
  { timestamps: true }
);

export const ShiftConfig = mongoose.model("ShiftConfig", shiftConfigSchema);
