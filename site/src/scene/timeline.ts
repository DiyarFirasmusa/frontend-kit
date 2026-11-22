export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value))

export const smooth = (t: number): number => t * t * (3 - 2 * t)

const ENTER_AT = 0.9
const SETTLED_AT = 0.22

/**
 * Where the page is, as a fractional chapter index: 1.5 is half-way from the second chapter to the third.
 * A chapter takes over while its top edge climbs from 90% to 22% of the viewport.
 */
export function chapterAt(tops: readonly number[], viewport: number): number {
  let index = 0
  for (const top of tops.slice(1)) {
    index += clamp((ENTER_AT * viewport - top) / ((ENTER_AT - SETTLED_AT) * viewport))
  }
  return index
}

/** Parts leave one after another: the progress of part `index` when the whole move is at `progress`. */
export function staggered(progress: number, index: number, spread = 0.55): number {
  const delay = ((index * 0.618034) % 1) * spread
  return smooth(clamp(progress * (1 + spread) - delay))
}
