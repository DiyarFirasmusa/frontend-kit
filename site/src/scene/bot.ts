import { plastic as c } from './palette.ts'
import { bar, block, type Formation, type Part, type Pose, type Vec3 } from './parts.ts'

const NECK: Vec3 = [0, 0.75, 0]

/** Turns a part around the neck, so the whole head follows the pointer. */
function turnHead(part: Part, yaw: number, pitch: number): Part {
  const [x, y, z] = [part.at[0] - NECK[0], part.at[1] - NECK[1], part.at[2] - NECK[2]]
  const y1 = y * Math.cos(pitch) - z * Math.sin(pitch)
  const z1 = y * Math.sin(pitch) + z * Math.cos(pitch)
  return {
    ...part,
    at: [NECK[0] + x * Math.cos(yaw) + z1 * Math.sin(yaw), NECK[1] + y1, NECK[2] - x * Math.sin(yaw) + z1 * Math.cos(yaw)],
    turn: [part.turn[0] + pitch, part.turn[1] + yaw, part.turn[2]],
  }
}

/** Kit, the builder: a browser-window head on a body made of interface controls. */
export function bot(pose: Pose, cheer = false): Formation {
  const { time, lookX, lookY, jump } = pose
  const blink = time % 3.8 < 0.13 ? 0.12 : 1
  const wave = Math.sin(time * 4) * 0.16
  const tuck = jump * 0.55
  const raised = cheer || jump > 0.08

  const head = [
    block([0, 2.05, 0], [3.2, 2.5, 1.8], c.shell, 0.62),
    block([0, 1.88, 0.89], [2.65, 1.5, 0.3], c.ink, 0.42),
    block([-0.58, 1.94, 1.07], [0.38, 0.66 * blink, 0.14], c.mint, 0.19 * blink),
    block([0.58, 1.94, 1.07], [0.38, 0.66 * blink, 0.14], c.mint, 0.19 * blink),
    bar([-0.2, 1.4, 1.07], [0.2, 1.4, 1.07], 0.09, c.mint),
    block([-0.98, 2.92, 0.88], [0.23, 0.23, 0.16], c.red, 0.115),
    block([-0.64, 2.92, 0.88], [0.23, 0.23, 0.16], c.yellow, 0.115),
    block([-0.3, 2.92, 0.88], [0.23, 0.23, 0.16], c.mint, 0.115),
    block([-1.69, 1.95, 0], [0.36, 0.95, 0.9], c.red, 0.17),
    block([1.69, 1.95, 0], [0.36, 0.95, 0.9], c.red, 0.17),
    bar([0.85, 3.2, 0], [1.1, 3.8, 0], 0.15, c.ink),
    block([1.12, 3.95, 0], [0.48, 0.48, 0.48], c.yellow, 0.24),
  ].map((part) => turnHead(part, lookX * 0.42, lookY * 0.22))

  const toggle = jump > 0.08 ? 0.27 : Math.sin(time * 1.3) > 0 ? 0.27 : -0.27

  const body = [
    block([0, 0.72, 0], [0.8, 0.5, 0.7], c.ink, 0.12),
    block([0, -0.45, 0], [2.6, 2.1, 1.45], c.blue, 0.5),
    block([0, -0.3, 0.74], [1.8, 1.18, 0.24], c.shell, 0.28),
    block([0, -0.18, 0.89], [1.1, 0.5, 0.16], toggle > 0 ? c.mint : c.steel, 0.25),
    block([toggle, -0.18, 1], [0.38, 0.38, 0.16], c.ink, 0.19),
    bar([-0.48, -0.64, 0.9], [0.1, -0.64, 0.9], 0.11, c.pink),
    block([0.48, -0.64, 0.9], [0.17, 0.17, 0.12], c.red, 0.085),
    block([0, -1.61, 0], [1.85, 0.55, 1.15], c.ink, 0.22),
  ]

  const arm = (side: -1 | 1, up: boolean): Part[] => {
    const sway = up ? wave : Math.sin(time * 1.8 + side) * 0.06
    const shoulder: Vec3 = [side * 1.55, 0.15, 0]
    const elbow: Vec3 = up ? [side * 2.35, 0.4, 0.1] : [side * 2.05, -0.72, 0.1]
    const wrist: Vec3 = up ? [side * 2.5 + sway, 1.35, 0.3] : [side * 2.2, -1.6 + sway, 0.4]
    const reach = up ? 1 : -1
    return [
      block(shoulder, [0.92, 0.92, 1.05], c.red, 0.4),
      bar(shoulder, elbow, 0.45, c.ink),
      bar(elbow, wrist, 0.62, c.shell),
      block(wrist, [0.68, 0.62, 0.66], c.yellow, 0.25),
      bar([wrist[0] - 0.2, wrist[1], 0.5], [wrist[0] - 0.27, wrist[1] + 0.5 * reach, 0.5], 0.2, c.yellow),
      bar([wrist[0] + 0.04, wrist[1], 0.5], [wrist[0] + 0.09, wrist[1] + 0.58 * reach, 0.5], 0.2, c.yellow),
      bar([wrist[0] + 0.24, wrist[1], 0.4], [wrist[0] + 0.36, wrist[1] + 0.4 * reach, 0.4], 0.19, c.yellow),
    ]
  }

  const leg = (side: -1 | 1): Part[] => {
    const knee: Vec3 = [side * (0.72 + tuck * 0.35), -2.4 + tuck * 0.4, tuck]
    const ankle: Vec3 = [side * (0.82 + tuck * 0.2), -3.35 + tuck, 0]
    return [
      bar([side * 0.6, -1.7, 0], knee, 0.45, c.ink),
      bar(knee, ankle, 0.78, c.shell),
      block([knee[0], knee[1], knee[2] + 0.36], [0.52, 0.52, 0.3], c.yellow, 0.2),
      block([ankle[0] + side * 0.14, ankle[1] - 0.38, 0.28], [1.2, 0.6, 1.5], c.red, 0.26),
    ]
  }

  const parts = [...head, ...body, ...arm(-1, cheer), ...arm(1, raised || !cheer), ...leg(-1), ...leg(1)]
  const lift = jump * 1.15 + Math.sin(time * 1.8) * 0.06

  return {
    width: 7.2,
    height: 8.6,
    tilt: [0.03, -0.22, 0],
    parts: parts.map((part) => ({ ...part, at: [part.at[0], part.at[1] + lift, part.at[2]] })),
  }
}
