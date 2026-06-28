const toMinutes = (value) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(normalized / 60)).padStart(2, "0");
  const m = String(normalized % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const normalizeWindow = (start, duration, shiftStart) => {
  let from = toMinutes(start);
  let to = from + Number(duration || 0);
  if (from < shiftStart) {
    from += 1440;
    to += 1440;
  }
  return { from, to };
};

const overlap = (aStart, aEnd, bStart, bEnd) => Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));

export const generateHourBuckets = (shift) => {
  const shiftStart = toMinutes(shift.startTime);
  let shiftEnd = toMinutes(shift.endTime);
  if (shiftEnd <= shiftStart) shiftEnd += 1440;

  const windows = [];
  if (shift.lunch?.start && shift.lunch?.duration_min > 0) {
    windows.push(normalizeWindow(shift.lunch.start, shift.lunch.duration_min, shiftStart));
  }
  for (const brk of shift.breaks || []) {
    windows.push(normalizeWindow(brk.start, brk.duration_min, shiftStart));
  }

  const buckets = [];
  for (let cursor = shiftStart; cursor < shiftEnd; cursor += 60) {
    const start = cursor;
    const end = Math.min(cursor + 60, shiftEnd);
    const blocked = windows.reduce((acc, w) => acc + overlap(start, end, w.from, w.to), 0);
    buckets.push({
      start: toHHMM(start),
      end: toHHMM(end),
      availableMinutes: Math.max(0, end - start - blocked),
      isBreakOverlap: blocked > 0
    });
  }
  return buckets;
};
