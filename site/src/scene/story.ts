import { bot } from './bot.ts'
import { plastic as c } from './palette.ts'
import { bar, block, REST, type Formation, type Pose } from './parts.ts'
import { website } from './screens.ts'

/** The robot in pieces, adrift: Claude without a kit. */
export function loose({ time, lookX, lookY }: Pose): Formation {
  const source = bot(REST).parts
  const parts = source.map((part, i) => {
    const angle = i * 2.39996
    const reach = 0.85 * Math.sqrt(i + 0.7)
    const drift = time * 0.35 + i
    return {
      ...part,
      at: [
        Math.cos(angle) * reach + Math.sin(drift) * 0.18,
        Math.sin(angle) * reach + Math.cos(drift * 1.2) * 0.18,
        Math.sin(i * 1.7) * 1.4,
      ] as Formation['parts'][number]['at'],
      size: part.size.map((n) => n * 0.72) as Formation['parts'][number]['size'],
      radius: part.radius * 0.72,
      turn: [Math.sin(i) * 0.7 + time * 0.05, Math.cos(i * 1.3) * 0.7, angle + time * 0.08] as Formation['tilt'],
    }
  })
  return { width: 12, height: 12, tilt: [lookY * 0.16, lookX * 0.2, 0], parts }
}

const BELT = 4.6
const PACKETS = 5

/** An inspection line: edits go in plain and come out stamped. */
export function line({ time, lookX, lookY }: Pose): Formation {
  const packets = Array.from({ length: PACKETS }, (_, i) => {
    const x = ((time * 0.75 + (i * BELT * 2) / PACKETS) % (BELT * 2)) - BELT
    // Shrinks at both ends so the loop never pops.
    const grow = Math.max(0.02, Math.min(1, (BELT - Math.abs(x)) * 1.8))
    const passed = x > 0
    return [
      block([x, -0.7, 0.3], [1.3 * grow, 1.3 * grow, 1 * grow], passed ? c.mint : c.shell, 0.28 * grow),
      bar([x - 0.3 * grow, -0.7, 0.86], [x - 0.05 * grow, passed ? -0.95 : -0.7, 0.86], 0.13 * grow, c.ink),
      bar([x - 0.05 * grow, passed ? -0.95 : -0.7, 0.86], [x + 0.35 * grow, passed ? -0.4 : -0.7, 0.86], 0.13 * grow, c.ink),
    ]
  }).flat()

  const parts = [
    block([0, -1.75, 0.2], [10, 0.7, 1.9], c.ink, 0.34),
    ...Array.from({ length: 8 }, (_, i) =>
      block([(i - 3.5) * 1.2, -1.75, 1.17], [0.44, 0.44, 0.14], c.steel, 0.22, [0, 0, -time * 2]),
    ),
    block([-3.6, -2.8, 0], [0.6, 1.6, 1], c.blue, 0.2),
    block([3.6, -2.8, 0], [0.6, 1.6, 1], c.blue, 0.2),
    block([-1.2, 0.3, -0.9], [0.65, 3.8, 0.7], c.shell, 0.25),
    block([1.2, 0.3, -0.9], [0.65, 3.8, 0.7], c.shell, 0.25),
    block([0, 2.4, -0.4], [4.2, 1.8, 1.6], c.blue, 0.5),
    block([0, 2.4, 0.46], [3.3, 1.1, 0.25], c.ink, 0.35),
    block([-0.65, 2.4, 0.64], [0.3, 0.55, 0.12], c.mint, 0.15),
    block([0.65, 2.4, 0.64], [0.3, 0.55, 0.12], c.mint, 0.15),
    block([0, 1.4, 0.2], [1.5, 0.35, 0.6], c.red, 0.15),
    block([0, 0.15 + Math.sin(time * 4) * 0.55, 0.95], [1.8, 0.08, 0.08], c.red, 0.04),
    ...packets,
  ]
  return { width: 10.8, height: 8, tilt: [0.12 + lookY * 0.1, -0.25 + lookX * 0.14, 0], parts }
}

/** A website half rebuilt: one side in place, the other still out of line. */
export function rebuild(pose: Pose): Formation {
  const { parts } = website(pose)
  return {
    width: 10.8,
    height: 9,
    tilt: [-0.1 + pose.lookY * 0.1, 0.28 + pose.lookX * 0.14, 0],
    parts: parts.map((part, i) => {
      if (i === 0 || part.at[0] < 0.2) return part
      const wobble = Math.sin(pose.time * 0.8 + i) * 0.15
      return {
        ...part,
        at: [part.at[0] + 0.4 + Math.sin(i) * 0.5, part.at[1] + Math.cos(i * 1.6) * 0.8 + wobble, part.at[2] + 0.5 + (i % 3) * 0.3],
        turn: [0, 0, Math.sin(i * 2.1) * 0.5 + wobble * 0.4],
      }
    }),
  }
}
