export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value))
export const smooth = (t: number): number => t * t * (3 - 2 * t)
export const smoother = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10)
export const easeOut = (t: number): number => 1 - (1 - t) ** 4
export const mix = (from: number, to: number, t: number): number => from + (to - from) * t

/** A scene holds still for `hold` screens of scroll, then flies to the next for `travel`. */
export interface Beat {
  hold: number
  travel: number
}

export interface Playhead {
  index: number
  next: number
  hold: number
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
  for (const { hold, travel } of beats) {
    starts.push(length)
    length += hold + travel
  }
  const last = beats.length - 1

  return {
    starts,
    length,
    at(position) {
      let index = 0
      while (index < last && position >= starts[index + 1]!) index++
      const { hold, travel } = beats[index]!
      const local = position - starts[index]!
      return {
        index,
        next: Math.min(index + 1, last),
        hold: clamp(local / hold),
        move: travel > 0 ? clamp((local - hold) / travel) : 0,
      }
    },
  }
}
