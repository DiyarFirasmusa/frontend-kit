const NICE_STEPS = [1, 2, 2.5, 4, 5, 10] as const;

/** Evenly spaced axis ticks from 0 that cover `max` with round steps (0 / 400 / 800 / 1,200). */
export function niceTicks(max: number, count = 4): number[] {
  const intervals = Math.max(1, count - 1);
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  if (safeMax === 0) {
    return Array.from({ length: count }, (_, index) => index);
  }
  const raw = safeMax / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const factor =
    NICE_STEPS.find((step) => step * magnitude >= raw) ?? NICE_STEPS[5];
  const step = factor * magnitude;
  return Array.from({ length: count }, (_, index) => index * step);
}

/** Up to `count` indexes, anchored on the last point and stepping back evenly, plus the first. */
export function pickTickIndexes(length: number, count = 6): number[] {
  if (length <= 0) {
    return [];
  }
  if (length <= count) {
    return Array.from({ length }, (_, index) => index);
  }
  const last = length - 1;
  const step = Math.ceil(last / (count - 1));
  const picked = new Set<number>([0]);
  for (let k = 0; k < count - 1; k += 1) {
    const index = last - k * step;
    if (index > 0) {
      picked.add(index);
    }
  }
  return [...picked].toSorted((a, b) => a - b);
}
