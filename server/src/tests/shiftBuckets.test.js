import test from "node:test";
import assert from "node:assert/strict";
import { generateShiftBuckets } from "../utils/shiftBuckets.js";

test("generates buckets for same-day shift", () => {
  const buckets = generateShiftBuckets({
    start: "07:00",
    end: "10:00",
    breaks: []
  });

  assert.equal(buckets.length, 3);
  assert.deepEqual(
    buckets.map((b) => b.timeRange),
    ["07:00 to 08:00", "08:00 to 09:00", "09:00 to 10:00"]
  );
});

test("handles overnight shifts crossing midnight (23:00 to 07:00)", () => {
  const buckets = generateShiftBuckets({
    start: "23:00",
    end: "07:00",
    breaks: []
  });

  assert.equal(buckets.length, 8);
  assert.deepEqual(
    buckets.map((b) => b.timeRange),
    [
      "23:00 to 00:00",
      "00:00 to 01:00",
      "01:00 to 02:00",
      "02:00 to 03:00",
      "03:00 to 04:00",
      "04:00 to 05:00",
      "05:00 to 06:00",
      "06:00 to 07:00"
    ]
  );
});

test("applies break on exact hour boundary", () => {
  const buckets = generateShiftBuckets({
    start: "07:00",
    end: "10:00",
    breaks: [{ start: "08:00", end: "08:15" }]
  });

  const middle = buckets.find((b) => b.timeRange === "08:00 to 09:00");
  assert.equal(middle.excludedMinutes, 15);
  assert.equal(middle.workingMinutes, 45);
});
