import { plastic as c } from './palette.ts'
import { bar, block, type Formation, type Pose } from './parts.ts'

export type GateState = 'idle' | 'open' | 'shut'

export function gate(state: GateState, { time, lookX, lookY }: Pose): Formation {
  const raise = { idle: 2.2, open: 4.2, shut: 0 }[state]
  const signal = { idle: c.yellow, open: c.mint, shut: c.red }[state]
  const pulse = 1 + Math.sin(time * 6) * 0.08
  const packetZ = state === 'open' ? -2.6 : 1.8

  const parts = [
    block([-3.4, 0, 0], [1.4, 7, 1.6], c.shell, 0.4),
    block([3.4, 0, 0], [1.4, 7, 1.6], c.shell, 0.4),
    block([0, 3.5, 0], [8.4, 1.4, 1.9], c.blue, 0.4),
    block([0, 3.5, 1], [4.2, 0.8, 0.3], c.ink, 0.3),
    ...[-1.3, 0, 1.3].map((x) => block([x, 3.5, 1.2], [0.46 * pulse, 0.46 * pulse, 0.2], signal, 0.23 * pulse)),
    ...[-3.4, 3.4].flatMap((x) => [
      block([x, -3.6, 0], [2, 0.8, 2.2], c.ink, 0.25),
      ...[-1.9, -0.7, 0.5, 1.7].map((y) => block([x, y, 0.85], [0.85, 0.3, 0.22], signal, 0.12)),
    ]),
    // The portcullis: shortens into the lintel as it rises.
    ...[-2.1, -1.05, 0, 1.05, 2.1].flatMap((x) => {
      const bottom = -3.2 + raise * 1.35
      return [bar([x, 2.9, 0], [x, bottom, 0], 0.38, signal), block([x, bottom - 0.12, 0], [0.6, 0.6, 0.6], c.ink, 0.15)]
    }),
    ...[-2, 0].map((y) =>
      block([0, Math.min(y + raise * 1.4, 2.8), 0.1], [5.4, 0.3, 0.4], c.steel, 0.15),
    ),
    block([0, -1.3, packetZ], [1.7, 1.4, 0.6], c.pink, 0.3, [0, 0, Math.sin(time * 2) * 0.08]),
    bar([-0.42, -1.05, packetZ + 0.35], [-0.08, -1.3, packetZ + 0.35], 0.14, c.ink),
    bar([-0.08, -1.3, packetZ + 0.35], [-0.42, -1.55, packetZ + 0.35], 0.14, c.ink),
    bar([0.1, -1.58, packetZ + 0.35], [0.45, -1.58, packetZ + 0.35], 0.14, c.ink),
  ]
  return { width: 9.4, height: 9, tilt: [lookY * 0.1, 0.22 + lookX * 0.14, 0], parts }
}
