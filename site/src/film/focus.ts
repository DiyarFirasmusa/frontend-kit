import type { Vec3 } from './shapes/blocks.ts'
import type { ShapeName } from './shapes/index.ts'
import { clamp, mix } from './timeline.ts'

/** The camera's attention on the one thing being explained. */
export interface Focus {
  eye: Vec3
  look: Vec3
  at: Vec3
  /** Half-widths of what lights up around `at`. */
  reach: Vec3
}

type Frame = (anchor: Vec3) => Focus

const FRAMES: Partial<Record<ShapeName, Frame>> = {
  // A step back from the plate, towards the middle of the curved wall.
  skills: ([x, y, z]) => ({ eye: [x * 0.42, y + 0.2, z * 0.42], look: [x, y, z], at: [x, y, z], reach: [2.5, 1.75, 2.5] }),
  agents: ([x, , z]) => ({ eye: [x * -0.22, 5.5, z * -0.22], look: [x, 7.2, z], at: [x, 6, z], reach: [1.9, 12, 1.9] }),
  rules: ([x, y, z]) => ({ eye: [x * 0.18, 5, z * 0.18], look: [x, y * 0.5, z], at: [x, y * 0.5, z], reach: [3.3, 10, 3.3] }),
  checks: ([x, y, z]) => ({ eye: [x + 1.4, y + 0.4, z + 19], look: [x, y, z - 30], at: [x, y, z - 0.8], reach: [30, 30, 2.2] }),
}

/** How far back the camera pulls in the middle of a flight, for each unit it crosses. */
const PULL_BACK = 0.22

/** One flight from object to object: straight there, stepping back on the way so both are seen. */
export function flyBetween(a: Focus, b: Focus, t: number): Focus {
  const eye = between(a.eye, b.eye, t)
  const look = between(a.look, b.look, t)
  const distance = Math.hypot(b.look[0] - a.look[0], b.look[1] - a.look[1], b.look[2] - a.look[2])
  const back = Math.min(0.6, (distance * PULL_BACK) / 10) * Math.sin(Math.PI * t)
  return { eye: between(eye, look, -back), look, at: between(a.at, b.at, t), reach: between(a.reach, b.reach, t) }
}

const between = (a: Vec3, b: Vec3, t: number): Vec3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]

/** The focus at a fractional stop, gliding between neighbours. */
export function focusAt(shape: ShapeName, anchors: readonly Vec3[] | undefined, stop: number): Focus | undefined {
  const frame = FRAMES[shape]
  if (!frame || !anchors?.length || stop < 0) return undefined
  const last = anchors.length - 1
  const whole = Math.floor(clamp(stop, 0, last))
  const a = frame(anchors[whole]!)
  const b = frame(anchors[Math.min(whole + 1, last)]!)
  const t = clamp(stop - whole)
  return { eye: between(a.eye, b.eye, t), look: between(a.look, b.look, t), at: between(a.at, b.at, t), reach: a.reach }
}
