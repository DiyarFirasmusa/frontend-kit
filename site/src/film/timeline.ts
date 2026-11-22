export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value))
export const smooth = (t: number): number => t * t * (3 - 2 * t)
export const smoother = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10)
export const easeOut = (t: number): number => 1 - (1 - t) ** 4
export const mix = (from: number, to: number, t: number): number => from + (to - from) * t

/** How far into the reading the stage has turned aside for it, in screens. */
const TURN_ASIDE = 0.6

/**
 * A scene holds still for `hold` screens of scroll, lets its explanation scroll past for `reading`,
 * then flies to the next for `travel`.
 */
export interface Beat {
  hold: number
  reading: number
  travel: number
}

export interface Playhead {
  index: number
  next: number
  hold: number
  /** 0 to 1 through the explanation. */
  read: number
  /** 0 is the scene alone, 1 is the stage turned aside beside its explanation. */
  aside: number
  move: number
}

export interface Timeline {
  starts: number[]
  length: number
  at(position: number): Playhead
}

export function createTimeline(beats: readonly Beat[]): Timeline {
  const starts: number[] = []
  let length = 0
  for (const { hold, reading, travel } of beats) {
    starts.push(length)
    length += hold + reading + travel
  }
  const last = beats.length - 1

  return {
    starts,
    length,
    at(position) {
      let index = 0
      while (index < last && position >= starts[index + 1]!) index++
      const { hold, reading, travel } = beats[index]!
      const past = position - starts[index]! - hold
      return {
        index,
        next: Math.min(index + 1, last),
        hold: clamp((past + hold) / hold),
        read: reading > 0 ? clamp(past / reading) : 0,
        aside: reading > 0 ? smooth(clamp(past / TURN_ASIDE)) : 0,
        move: travel > 0 ? clamp((past - reading) / travel) : 0,
      }
    },
  }
}

/** Where `middle` falls among the stops' centres, as a fractional stop number. */
export function stopAt(centres: readonly number[], middle: number): number {
  if (centres.length === 0) return -1
  if (middle <= centres[0]!) return 0
  for (let i = 1; i < centres.length; i++) {
    const before = centres[i - 1]!
    const after = centres[i]!
    if (middle > after) continue
    // Rests on each stop, then turns to the next.
    return i - 1 + smooth(clamp(((middle - before) / Math.max(1, after - before) - 0.2) / 0.6))
  }
  return centres.length - 1
}
