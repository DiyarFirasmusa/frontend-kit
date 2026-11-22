import { plastic as c } from './palette.ts'
import { bar, block, type Formation, type Part, type Pose } from './parts.ts'

const tiltTo = ({ lookX, lookY }: Pose, yaw = -0.3): Formation['tilt'] => [-0.08 + lookY * 0.12, yaw + lookX * 0.16, 0.02]

function browser(): Part[] {
  return [
    block([0, 0, -0.3], [9, 6.6, 0.4], c.shell, 0.45),
    block([0, 2.85, 0], [9, 0.9, 0.3], c.ink, 0.3),
    block([-3.95, 2.85, 0.2], [0.26, 0.26, 0.14], c.red, 0.13),
    block([-3.55, 2.85, 0.2], [0.26, 0.26, 0.14], c.yellow, 0.13),
    block([-3.15, 2.85, 0.2], [0.26, 0.26, 0.14], c.mint, 0.13),
    block([0.3, 2.85, 0.2], [4.4, 0.4, 0.12], c.steel, 0.2),
  ]
}

export function website(pose: Pose): Formation {
  const parts = [
    ...browser(),
    block([-3.7, 1.85, 0.2], [0.6, 0.6, 0.3], c.blue, 0.18),
    bar([-1.2, 1.85, 0.1], [-0.5, 1.85, 0.1], 0.15, c.steel),
    bar([0.1, 1.85, 0.1], [0.8, 1.85, 0.1], 0.15, c.steel),
    bar([1.4, 1.85, 0.1], [2.1, 1.85, 0.1], 0.15, c.steel),
    block([3.45, 1.85, 0.25], [1.3, 0.52, 0.3], c.red, 0.26),
    block([-2.15, 0.8, 0.2], [3.6, 0.5, 0.3], c.ink, 0.15),
    block([-2.6, 0.18, 0.2], [2.7, 0.5, 0.3], c.ink, 0.15),
    bar([-3.8, -0.4, 0.1], [-0.9, -0.4, 0.1], 0.14, c.steel),
    block([-3.2, -1.05, 0.3], [1.6, 0.6, 0.35], c.blue, 0.3),
    block([2.15, 0.05, 0.15], [3.8, 2.6, 0.3], c.sky, 0.32),
    block([3.15, 0.65, 0.45], [0.8, 0.8, 0.3], c.yellow, 0.4),
    block([1.6, -0.6, 0.45], [2, 1.1, 0.3], c.mint, 0.5),
    block([2.75, -0.8, 0.6], [1.5, 0.75, 0.3], c.blue, 0.36),
    ...[c.pink, c.yellow, c.mint].flatMap((color, i) => {
      const x = (i - 1) * 2.85
      return [
        block([x, -2.28, 0.05], [2.6, 1.5, 0.2], c.steel, 0.25),
        block([x, -2.05, 0.3], [2.3, 0.78, 0.25], color, 0.2),
        bar([x - 0.9, -2.7, 0.25], [x + 0.3, -2.7, 0.25], 0.13, c.ink),
      ]
    }),
  ]
  return { width: 10, height: 7.8, tilt: tiltTo(pose), parts }
}

export function dashboard(pose: Pose): Formation {
  const heights = [0.6, 1, 0.8, 1.35, 1.1, 1.6, 1.3]
  const parts = [
    ...browser(),
    block([-3.5, -0.45, 0.1], [1.8, 5.2, 0.3], c.blue, 0.3),
    block([-3.95, 1.6, 0.35], [0.55, 0.55, 0.3], c.yellow, 0.16),
    ...[0.8, 0.2, -0.4, -1, -1.6].map((y, i) =>
      block([-3.5, y, 0.35], [1.35, 0.38, 0.22], i === 0 ? c.shell : c.sky, 0.19),
    ),
    ...[c.pink, c.mint, c.yellow].flatMap((color, i) => {
      const x = -1.35 + i * 2.2
      return [block([x, 1.6, 0.2], [2, 1.05, 0.3], color, 0.24), bar([x - 0.6, 1.5, 0.4], [x + 0.2, 1.5, 0.4], 0.22, c.ink)]
    }),
    ...heights.map((base, i) => {
      const height = base + Math.sin(pose.time * 1.4 + i) * 0.16
      return block([-1.9 + i * 0.93, -1 + height / 2, 0.25], [0.6, height, 0.4], i === 5 ? c.red : c.blue, 0.14)
    }),
    ...[-1.55, -2.1, -2.65].flatMap((y, i) => [
      block([0.85, y, 0.1], [6.4, 0.42, 0.14], c.steel, 0.15),
      bar([-1.9, y, 0.25], [-0.2, y, 0.25], 0.12, c.ink),
      block([3.2, y, 0.3], [1, 0.3, 0.16], [c.mint, c.yellow, c.pink][i] ?? c.mint, 0.15),
    ]),
  ]
  return { width: 10, height: 7.8, tilt: tiltTo(pose, 0.3), parts }
}

export function react({ time, lookX, lookY }: Pose): Formation {
  const SEGMENTS = 19
  const parts: Part[] = [block([0, 0, 0], [2, 2, 1.5], c.blue, 1)]
  for (let orbit = 0; orbit < 3; orbit++) {
    const angle = (orbit * Math.PI) / 3 + time * 0.12
    const onOrbit = (turn: number): Part['at'] => {
      const x = Math.cos(turn) * 4.2
      const y = Math.sin(turn) * 1.5
      return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle), Math.sin(turn) * 0.8]
    }
    const color = [c.shell, c.red, c.yellow][orbit] ?? c.shell
    for (let i = 0; i < SEGMENTS; i++) {
      parts.push(bar(onOrbit((i / SEGMENTS) * Math.PI * 2), onOrbit(((i + 1) / SEGMENTS) * Math.PI * 2), 0.23, color))
    }
    parts.push(block(onOrbit(time * 0.9 + orbit * 2), [0.75, 0.75, 0.75], c.ink, 0.375))
  }
  return { width: 9.6, height: 9, tilt: [lookY * 0.3, lookX * 0.4, 0], parts }
}

export function fullstack(pose: Pose): Formation {
  const admin = dashboard(pose).parts.map(
    (part): Part => ({
      ...part,
      at: [part.at[0] * 0.8 - 1.2, part.at[1] * 0.8 + 0.7, part.at[2] * 0.8 - 0.8],
      size: [part.size[0] * 0.8, part.size[1] * 0.8, part.size[2] * 0.8],
      radius: part.radius * 0.8,
    }),
  )
  const site = [
    block([3, -1, 1], [3.1, 5.4, 0.5], c.ink, 0.6),
    block([3, -1, 1.28], [2.7, 4.9, 0.16], c.shell, 0.45),
    block([3, 1.1, 1.45], [0.9, 0.22, 0.12], c.ink, 0.11),
    block([3, -0.05, 1.45], [2.3, 1.5, 0.2], c.sky, 0.25),
    block([3.55, 0.25, 1.65], [0.55, 0.55, 0.2], c.yellow, 0.275),
    block([2.8, -1.15, 1.45], [1.9, 0.32, 0.18], c.ink, 0.12),
    bar([2.05, -1.65, 1.45], [3.5, -1.65, 1.45], 0.12, c.steel),
    block([3, -2.5, 1.5], [2.1, 0.62, 0.3], c.red, 0.31),
  ]
  return { width: 10.5, height: 8, tilt: tiltTo(pose, -0.18), parts: [...admin, ...site] }
}

/** The website pulled apart along its depth, as on an instruction sheet. */
export function exploded(pose: Pose): Formation {
  const spread = 2.4 + Math.sin(pose.time * 0.9) * 0.5
  const { parts } = website(pose)
  return {
    width: 10.8,
    height: 9.4,
    tilt: [-0.34 + pose.lookY * 0.1, -0.62 + pose.lookX * 0.12, 0.08],
    parts: parts.map((part, i) => ({
      ...part,
      at: [part.at[0], part.at[1], part.at[2] * spread * 1.6 + ((i % 5) - 2) * 0.12],
    })),
  }
}
