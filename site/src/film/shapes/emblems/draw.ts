// A few pencils for drawing signs that are then built out of blocks.

export type Point = [x: number, y: number]

export interface Ink {
  /** How far it stands out of the sign. */
  z: number
  /** Above zero it shines; below zero it is dark glass. */
  glow: number
}

export interface Mark extends Ink {
  covers(x: number, y: number): boolean
}

export const METAL: Ink = { z: 0.5, glow: 0 }
export const GLASS: Ink = { z: 0, glow: -0.8 }
export const LIGHT: Ink = { z: 1.05, glow: 0.7 }
export const CUT: Ink = { z: 0.8, glow: -0.97 }
export const RAISED: Ink = { z: 1, glow: 0 }

export const rect = (cx: number, cy: number, width: number, height: number, ink: Ink = METAL): Mark => ({
  ...ink,
  covers: (x, y) => Math.abs(x - cx) <= width / 2 && Math.abs(y - cy) <= height / 2,
})

export const disc = (cx: number, cy: number, radius: number, ink: Ink = METAL): Mark => ({
  ...ink,
  covers: (x, y) => Math.hypot(x - cx, y - cy) <= radius,
})

export const oval = (cx: number, cy: number, rx: number, ry: number, ink: Ink = METAL): Mark => ({
  ...ink,
  covers: (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
})

/** Part of a ring, from one angle anticlockwise to the other, in degrees. */
export function arc(cx: number, cy: number, radius: number, width: number, from = 0, to = 360, ink: Ink = METAL): Mark {
  return {
    ...ink,
    covers(x, y) {
      if (Math.abs(Math.hypot(x - cx, y - cy) - radius) > width / 2) return false
      const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI
      return (((angle - from) % 360) + 360) % 360 <= to - from
    },
  }
}

/** A stroke through the points, with round ends. */
export function path(points: readonly Point[], width: number, ink: Ink = METAL): Mark {
  const reach = (width / 2) ** 2
  return {
    ...ink,
    covers(x, y) {
      for (let i = 1; i < points.length; i++) {
        const [ax, ay] = points[i - 1]!
        const [bx, by] = points[i]!
        const dx = bx - ax
        const dy = by - ay
        const t = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)))
        if ((x - ax - dx * t) ** 2 + (y - ay - dy * t) ** 2 <= reach) return true
      }
      return false
    },
  }
}

export function area(points: readonly Point[], ink: Ink = METAL): Mark {
  return {
    ...ink,
    covers(x, y) {
      let inside = false
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [ax, ay] = points[i]!
        const [bx, by] = points[j]!
        if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside
      }
      return inside
    },
  }
}

/** The same marks, smaller and somewhere else. */
export const placed = (marks: readonly Mark[], scale: number, cx = 0, cy = 0, lift = 0): Mark[] =>
  marks.map(({ covers, z, glow }) => ({ z: z * scale + lift, glow, covers: (x, y) => covers((x - cx) / scale, (y - cy) / scale) }))
