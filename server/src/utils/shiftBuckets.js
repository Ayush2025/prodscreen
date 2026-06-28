const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const formatMinutes = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
};

const normalizeBreakRange = (start, end, shiftStartMinutes) => {
  let s = toMinutes(start);
  let e = toMinutes(end);
  if (e <= s) e += 1440;
  if (s < shiftStartMinutes) {
    s += 1440;
    e += 1440;
  }
  return { start: s, end: e };
};

export const generateShiftBuckets = ({ start, end, lunch, breaks = [] }) => {
  let startMinutes = toMinutes(start);
  let endMinutes = toMinutes(end);
  if (endMinutes <= startMinutes) {
    endMinutes += 1440;
  }

  const pauses = [];
  if (lunch?.start && lunch?.end) {
    pauses.push(normalizeBreakRange(lunch.start, lunch.end, startMinutes));
  }
  for (const item of breaks) {
    pauses.push(normalizeBreakRange(item.start, item.end, startMinutes));
  }

  const buckets = [];
  for (let cursor = startMinutes; cursor < endMinutes; cursor += 60) {
    const bucketStart = cursor;
    const bucketEnd = Math.min(cursor + 60, endMinutes);
    const excludedMinutes = pauses.reduce(
      (acc, pause) => acc + overlapMinutes(bucketStart, bucketEnd, pause.start, pause.end),
      0
    );
    buckets.push({
      timeRange: `${formatMinutes(bucketStart)} to ${formatMinutes(bucketEnd)}`,
      excludedMinutes,
      workingMinutes: Math.max(0, bucketEnd - bucketStart - excludedMinutes)
    });
  }

  return buckets;
};
