import { describe, expect, it } from "vitest";
import { generateHourBuckets } from "../utils/shiftEngine.js";

describe("generateHourBuckets", () => {
  it("builds 8-hour shift with one lunch", () => {
    const result = generateHourBuckets({
      startTime: "07:00",
      endTime: "15:00",
      lunch: { start: "12:00", duration_min: 30 },
      breaks: []
    });
    expect(result).toHaveLength(8);
    expect(result.find((b) => b.start === "12:00")?.availableMinutes).toBe(30);
  });

  it("handles lunch and two breaks", () => {
    const result = generateHourBuckets({
      startTime: "07:00",
      endTime: "15:00",
      lunch: { start: "12:00", duration_min: 30 },
      breaks: [
        { start: "09:30", duration_min: 10 },
        { start: "14:00", duration_min: 10 }
      ]
    });
    expect(result.find((b) => b.start === "09:00")?.isBreakOverlap).toBe(true);
    expect(result.find((b) => b.start === "14:00")?.availableMinutes).toBe(50);
  });

  it("supports overnight shifts 23:00 to 07:00", () => {
    const result = generateHourBuckets({
      startTime: "23:00",
      endTime: "07:00",
      lunch: { start: "03:00", duration_min: 20 },
      breaks: []
    });
    expect(result).toHaveLength(8);
    expect(result[0]).toMatchObject({ start: "23:00", end: "00:00" });
    expect(result[7]).toMatchObject({ start: "06:00", end: "07:00" });
  });

  it("handles break exactly on hour boundary", () => {
    const result = generateHourBuckets({
      startTime: "07:00",
      endTime: "10:00",
      lunch: { start: "", duration_min: 0 },
      breaks: [{ start: "08:00", duration_min: 15 }]
    });
    expect(result.find((b) => b.start === "08:00")?.availableMinutes).toBe(45);
  });
});
