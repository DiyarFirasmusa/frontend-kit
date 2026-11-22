import { plastic as c } from './palette.ts'
import { block, type Formation, type Pose } from './parts.ts'

export const CREW_SIZE = 10
const COATS = [c.mint, c.red, c.blue, c.pink, c.orange, c.sky, c.shell, c.blue, c.red, c.mint]

/** Ten small bots, one per agent, in two rows of five. */
export function crew({ time, lookX, lookY, focus }: Pose): Formation {
  const parts = Array.from({ length: CREW_SIZE }, (_, i) => {
    const active = i === focus
    const x = ((i % 5) - 2) * 2.15
    const y = (i < 5 ? 1.9 : -2) + (active ? 0.55 : Math.abs(Math.sin(time * 1.6 + i * 1.3)) * 0.16)
    const z = active ? 1.2 : 0
    const coat = COATS[i] ?? c.blue
    const yaw = lookX * 0.4
    return [
      block([x, y + 0.65, z], [1.65, 1.35, 1], coat, 0.38, [0, yaw, 0]),
      block([x, y + 0.6, z + 0.53], [1.3, 0.75, 0.16], c.ink, 0.25, [0, yaw, 0]),
      block([x - 0.28, y + 0.63, z + 0.65], [0.2, active ? 0.45 : 0.33, 0.1], c.yellow, 0.1),
      block([x + 0.28, y + 0.63, z + 0.65], [0.2, active ? 0.45 : 0.33, 0.1], c.yellow, 0.1),
      block([x, y - 0.5, z], [1.15, 0.95, 0.85], active ? c.shell : coat, 0.3),
      block([x - 0.35, y - 1.15, z], [0.4, 0.6, 0.7], c.ink, 0.16),
      block([x + 0.35, y - 1.15, z], [0.4, 0.6, 0.7], c.ink, 0.16),
    ]
  }).flat()
  return { width: 11.2, height: 8.2, tilt: [lookY * 0.1, -0.12, 0], parts }
}
