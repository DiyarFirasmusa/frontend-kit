export type Vec3 = [x: number, y: number, z: number]

/** One moulded part: a bevelled, rounded box. Every shape on the page is made of these. */
export interface Part {
  at: Vec3
  size: Vec3
  turn: Vec3
  radius: number
  color: string
}

export interface Formation {
  /** The box the formation fits in; the stage scales it into its slot. */
  width: number
  height: number
  /** Resting rotation of the whole formation. */
  tilt: Vec3
  parts: Part[]
}

export interface Pose {
  time: number
  /** Pointer position, -1 to 1 on both axes. */
  lookX: number
  lookY: number
  /** 0 on the ground, 1 at the top of a jump. */
  jump: number
  /** Index of the highlighted agent, or -1. */
  focus: number
}

export const REST: Pose = { time: 1, lookX: 0, lookY: 0, jump: 0, focus: -1 }

export function block(
  at: Vec3,
  size: Vec3,
  color: string,
  radius = Math.min(size[0], size[1]) * 0.2,
  turn: Vec3 = [0, 0, 0],
): Part {
  return { at, size, turn, radius, color }
}

/** A pill stretched between two points on the XY plane. */
export function bar(from: Vec3, to: Vec3, thickness: number, color: string, depth = thickness): Part {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  return block(
    [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
    [thickness, Math.hypot(dx, dy) + thickness * 0.5, depth],
    color,
    thickness / 2,
    [0, 0, Math.atan2(dy, dx) - Math.PI / 2],
  )
}
