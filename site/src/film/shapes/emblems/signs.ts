import { arc, area, CUT, disc, GLASS, LIGHT, METAL, oval, path, placed, RAISED, rect, type Mark, type Point } from './draw.ts'

// Each sign is drawn in a square from -8 to 8, and reads as one thing from across the room.
const LIFTED = { z: 1.4, glow: 0 }

const tick = (x: number, y: number, size: number, ink = LIGHT): Mark =>
  path([[x - size, y], [x - size * 0.3, y - size * 0.7], [x + size, y + size * 0.8]], size * 0.5, ink)
const cross = (x: number, y: number, size: number, ink = LIGHT): Mark[] => [
  path([[x - size, y - size], [x + size, y + size]], size * 0.45, ink),
  path([[x - size, y + size], [x + size, y - size]], size * 0.45, ink),
]
const spark = (x: number, y: number, size: number): Mark =>
  area([[x, y + size], [x + size * 0.28, y + size * 0.28], [x + size, y], [x + size * 0.28, y - size * 0.28], [x, y - size], [x - size * 0.28, y - size * 0.28], [x - size, y], [x - size * 0.28, y + size * 0.28]], LIGHT)
const bolt = (x: number, y: number, size: number, ink = LIGHT): Mark =>
  area(([[0.35, 1], [-0.7, -0.15], [-0.08, -0.15], [-0.35, -1], [0.7, 0.2], [0.08, 0.2]] as Point[]).map(([u, v]): Point => [x + u * size, y + v * size]), ink)
const browser = (): Mark[] => [rect(0, 0, 16, 13), rect(0, -1, 14.4, 9.6, CUT), disc(-6.6, 5, 0.55, LIGHT), disc(-5, 5, 0.55, CUT), disc(-3.4, 5, 0.55, CUT)]
const sheet = (): Mark[] => [area([[-6, -8], [6, -8], [6, 4.6], [2.8, 8], [-6, 8]], GLASS), path([[-6, -8], [6, -8], [6, 4.6], [2.8, 8], [-6, 8], [-6, -8]], 0.9), area([[2.8, 8], [2.8, 4.6], [6, 4.6]], RAISED)]
const gear = (): Mark[] => [
  ...Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4
    return path([[Math.cos(angle) * 4, Math.sin(angle) * 4], [Math.cos(angle) * 7.2, Math.sin(angle) * 7.2]], 2.6)
  }),
  disc(0, 0, 5.5),
  disc(0, 0, 2.5, CUT),
]
const shield = (): Mark[] => [
  area([[0, 8], [6.6, 5.6], [6.2, -1.6], [3.6, -5.6], [0, -8], [-3.6, -5.6], [-6.2, -1.6], [-6.6, 5.6]]),
  area([[0, 6.3], [5.1, 4.5], [4.8, -1.2], [2.8, -4.4], [0, -6.3], [-2.8, -4.4], [-4.8, -1.2], [-5.1, 4.5]], CUT),
]
const lock = (): Mark[] => [arc(0, 1.6, 3.4, 1.6, 0, 180, RAISED), rect(-3.4, 0.8, 1.6, 1.8, RAISED), rect(3.4, 0.8, 1.6, 1.8, RAISED), rect(0, -3, 10, 7, RAISED), disc(0, -2.2, 1.2, CUT), rect(0, -4, 1, 2.4, CUT)]
const person = (): Mark[] => [
  oval(0, 4.4, 2.55, 3.1, RAISED),
  rect(0, 4.7, 3.3, 0.6, LIGHT),
  rect(0, 0.9, 1.9, 2),
  area([[-6.6, -8], [-6.5, -3], [-5.4, -1.2], [-2, 0.2], [2, 0.2], [5.4, -1.2], [6.5, -3], [6.6, -8]]),
  area([[-2, 0.2], [0, -3.4], [2, 0.2]], CUT),
  path([[0, -3.4], [0, -5.6]], 0.8, LIGHT),
]
const magnifier = (): Mark[] => [path([[2.6, -2.6], [6.9, -6.9]], 2.6), disc(-1.2, 1.4, 5, GLASS), arc(-1.2, 1.4, 5.3, 1.7)]
const branches = (): Mark[] => [path([[-4, -6], [-4, 6]], 1.3), path([[-4, -2.2], [-1, 0], [2.5, 0.6], [4, 3.4]], 1.3), disc(-4, -6, 1.9, RAISED), disc(-4, 6, 1.9, RAISED), disc(4, 3.8, 1.9, LIGHT)]

/** The kit itself: the parts of an interface, still on their frame. */
export const kitMarks = (): Mark[] => [
  path([[-8, -7.4], [8, -7.4], [8, 7.4], [-8, 7.4], [-8, -7.4]], 1),
  ...([[[0, 5.2], [0, 7.4]], [[-5, 0], [-8, 0]], [[-4.4, -5], [-8, -5]], [[0, -5], [0, -7.4]], [[5, 1], [8, 1]], [[5, -5], [8, -5]]] as Point[][]).map((sprue) => path(sprue, 0.7)),
  rect(0, 4.5, 11.6, 2.1, RAISED),
  rect(-4.5, 4.5, 1.2, 1.1, LIGHT),
  rect(0.4, 4.5, 3.6, 0.5, CUT),
  rect(4.4, 4.5, 1.6, 0.9, LIGHT),
  rect(-4.5, -1.5, 2.6, 8.2, RAISED),
  ...[1.2, -0.6, -2.4, -4.2].map((y, i) => rect(-4.5, y, 1.5, 0.5, i ? CUT : LIGHT)),
  rect(1.8, 0.3, 8, 4.7, GLASS),
  ...[1.6, 2.8, 2.2, 3.8].map((height, i) => rect(-1 + i * 1.85, -1.7 + height / 2, 1.1, height, i === 3 ? LIGHT : RAISED)),
  rect(-0.4, -4.3, 3.6, 2.3, RAISED),
  rect(3.9, -4.3, 3.2, 2.3, LIGHT),
  tick(3.9, -4.3, 0.9, { z: 1.3, glow: -0.97 }),
]

export const SIGNS = {
  kit: kitMarks,
  component: () => [
    area([[-7, -6], [-7, 4], [-2.4, 4], [-2.8, 6.4], [-0.6, 8], [1.6, 6.4], [1.2, 4], [4.4, 4], [4.4, 0.6], [6.6, 1], [8, -1], [6.6, -3], [4.4, -2.6], [4.4, -6]]),
    path([[-3.2, 1], [-5, -1], [-3.2, -3]], 0.8, LIGHT),
    path([[0.6, 1], [2.4, -1], [0.6, -3]], 0.8, LIGHT),
  ],
  form: () => [rect(0, 0, 13, 16, GLASS), rect(-3, 6, 5, 0.9), rect(0, 3.8, 11, 2), rect(-3, 1, 5, 0.9), rect(0, -1.2, 11, 2), rect(-1, -1.2, 6, 0.6, CUT), rect(2.5, -5.4, 6, 2.6, LIGHT), tick(-4.4, -5.4, 1.2, RAISED)],
  hookLoop: () => [arc(0, 5.6, 1.7, 1.2), path([[0, 3.9], [0, 1.2], [1.4, -0.6], [3.4, -2.4]], 2), arc(0, -2.6, 3.8, 2, 180, 380), disc(-3.8, -2.2, 1, LIGHT)],
  store: () => [...[-4.8, 0, 4.8].flatMap((y) => [rect(0, y, 11, 2.6), oval(0, y - 1.3, 5.5, 1.3), oval(0, y + 1.3, 5.5, 1.3, RAISED)]), disc(3.4, -5, 0.6, LIGHT), disc(3.4, -0.2, 0.6, LIGHT)],
  figma: () => [disc(-2.6, 5.2, 2.6), rect(-1.3, 5.2, 2.6, 5.2), rect(1.4, 5.2, 2.8, 5.2, RAISED), disc(2.8, 5.2, 2.6, RAISED), disc(-2.6, 0, 2.6, RAISED), rect(-1.3, 0, 2.6, 5.2, RAISED), disc(2.8, 0, 2.6, LIGHT), disc(-2.6, -5.2, 2.6), rect(-1.3, -3.9, 2.6, 2.6)],
  brush: () => [path([[6.6, 6.8], [-0.8, -0.4]], 2.2), path([[0.2, 0.5], [-2, -1.7]], 3.4, RAISED), area([[-1.2, -1.2], [-3.6, 0], [-6, -2.4], [-7.6, -6.8], [-2.4, -6], [0, -3.8]], LIGHT), spark(-4.6, 5, 1.8)],
  bulb: () => [disc(0, 2, 4.6, LIGHT), rect(0, -2.6, 4.6, 2.4, LIGHT), rect(0, -4.8, 4.2, 1.2), rect(0, -6.6, 3.2, 1.2), path([[-1.8, 1.6], [0, -0.6], [1.8, 1.6]], 0.7, { z: 1.3, glow: -0.97 }), ...[20, 55, 125, 160].map((a) => path([[Math.cos((a * Math.PI) / 180) * 6.4, 2 + Math.sin((a * Math.PI) / 180) * 6.4], [Math.cos((a * Math.PI) / 180) * 7.8, 2 + Math.sin((a * Math.PI) / 180) * 7.8]], 0.8))],
  translate: () => [
    rect(-3, 3, 9.4, 8.6),
    area([[-6, -0.8], [-6.6, -4], [-2.4, -1]]),
    path([[-5.6, 0.6], [-3, 5.4], [-0.4, 0.6]], 1, CUT),
    path([[-4.6, 2.2], [-1.4, 2.2]], 0.9, CUT),
    rect(3.6, -3, 8.6, 7.6, LIFTED),
    area([[5.6, -6], [7, -8.2], [2.6, -6.6]], LIFTED),
    path([[1.4, -1.4], [3.4, -0.4], [5.8, -1.6], [5.6, -4], [3, -4.6], [1.4, -3.4]], 0.9, { z: 1.8, glow: -0.97 }),
    disc(3.6, -2.4, 0.55, { z: 1.8, glow: -0.97 }),
  ],
  key: () => [arc(-3.6, 3.2, 3.2, 2.2), path([[-1.2, 0.8], [6.4, -6.8]], 2.1), path([[3.6, -4], [5.8, -1.8]], 1.6), path([[5.4, -5.8], [7.4, -3.8]], 1.6), disc(-3.6, 3.2, 0.9, LIGHT)],
  typescript: () => [rect(0, 0, 15, 15), rect(-3.4, 1.8, 6, 1.6, CUT), rect(-3.4, -1.8, 1.7, 7.6, CUT), path([[6, 2], [3, 2.2], [1.6, 0.4], [3.4, -1.4], [5.4, -2.4], [5.4, -4.6], [3, -5.2], [1, -4.6]], 1.5, CUT)],
  signpost: () => [rect(0, -1, 1.5, 14), area([[-5.6, 6.4], [4.4, 6.4], [6.8, 4.6], [4.4, 2.8], [-5.6, 2.8]], RAISED), area([[5.6, 1], [-4.4, 1], [-6.8, -0.8], [-4.4, -2.6], [5.6, -2.6]], LIGHT), rect(0, -7.6, 6, 0.9)],
  table: () => [
    rect(0, 0, 16, 13, GLASS),
    rect(0, 5.2, 16, 2.6),
    ...[2, -1, -4].flatMap((y, row) => [-5.2, 0, 5.2].map((x, column) => rect(x, y, 4, 1.4, row === 1 && column === 2 ? LIGHT : METAL))),
    area([[4.2, 5.8], [6.4, 5.8], [5.3, 4.4]], CUT),
  ],
  funnel: () => [area([[-8, 7], [8, 7], [1.7, -0.6], [1.7, -5.4], [-1.7, -7.4], [-1.7, -0.6]]), rect(0, 5.5, 13, 1.1, CUT), disc(0, 2.4, 1.2, LIGHT)],
  record: () => [rect(0, 0, 16, 12.5, GLASS), rect(0, 5.4, 16, 1.7), disc(-4.4, 0.8, 2.6, RAISED), rect(3, 2, 7, 1.2), rect(2, -0.4, 5, 0.9), ...[-5, 0, 5].map((x, i) => rect(x, -4.2, 4, 1.6, i ? METAL : LIGHT))],
  crud: () => [rect(-4.2, 4.2, 7, 7), path([[-6.2, 4.2], [-2.2, 4.2]], 1.2, LIGHT), path([[-4.2, 2.2], [-4.2, 6.2]], 1.2, LIGHT), rect(4.2, 4.2, 7, 7), path([[2.6, 2.4], [5.8, 6]], 1.3, CUT), rect(-4.2, -4.2, 7, 7), tick(-4.2, -4.2, 2, CUT), rect(4.2, -4.2, 7, 7), ...cross(4.2, -4.2, 1.7, CUT)],
  sliders: () => [4.8, 0, -4.8].flatMap((y, i) => [rect(0, y, 15, 1.2), disc([-3, 3.6, -0.6][i]!, y, 1.9, i === 1 ? LIGHT : RAISED)]),
  browser: () => [...browser(), rect(0, 1.2, 12, 3), rect(-3, 1.2, 4, 0.8, CUT), ...[-4, 0, 4].map((x) => rect(x, -3.2, 3.4, 2.6, x ? METAL : LIGHT))],
  blocks: () => [rect(-4.2, -3.8, 7.2, 7.2), rect(4.2, -3.8, 7.2, 7.2, RAISED), rect(0, 4, 7.2, 7.2, LIGHT), ...[-4.2, 4.2].map((x) => disc(x, -3.8, 1.2, CUT))],
  seo: () => [...magnifier(), ...[-3.6, -1.2, 1.2].map((x, i) => rect(x, -0.2 + i * 0.85, 1.6, 2 + i * 1.7, i === 2 ? LIGHT : RAISED))],
  server: () => [5.1, 0, -5.1].flatMap((y, i) => [rect(-1, y, 13, 4.2), disc(-5.4, y, 0.8, i === 1 ? CUT : LIGHT), rect(1.4, y, 5.6, 0.8, CUT)]),
  ticket: () => [rect(0, -0.6, 12, 15), rect(0, 7, 5.6, 2.2, RAISED), ...[3.4, -0.6, -4.6].flatMap((y, i) => [tick(-3.4, y, 1.2, i === 2 ? CUT : LIGHT), rect(1.8, y, 5, 0.9, CUT)])],
  question: () => [rect(0, 1.2, 15, 11.6), area([[-4, -4.2], [-5.4, -8], [0.4, -4.2]]), path([[-2.2, 3.6], [-1.2, 5.2], [1.4, 5.2], [2.4, 3.4], [1, 1.8], [0, 0.6], [0, -0.6]], 1.4, LIGHT), disc(0, -2.8, 1, LIGHT)],
  terminal: () => [rect(0, 0, 16, 12.6), rect(0, -0.8, 14.2, 9.6, CUT), path([[-5, 2.2], [-2.4, -0.4], [-5, -3]], 1.1, LIGHT), rect(1.8, -3, 5, 1, RAISED)],
  broom: () => [path([[6.4, 7], [-0.6, 0]], 1.5), area([[-2.6, 1.8], [2, -2.8], [-1.6, -8], [-8, -2]], RAISED), path([[-2.6, 1.8], [2, -2.8]], 1.4, LIGHT), ...[-1.4, 0.4].map((d) => path([[-2.6 + d, -1 - d], [-4.6 + d, -5 - d]], 0.5, CUT)), spark(5.4, -4, 1.6)],
  rescue: () => [arc(0, 0, 5.6, 4.2), ...[45, 135, 225, 315].map((a) => arc(0, 0, 5.6, 4.2, a - 15, a + 15, LIGHT))],
  everywhere: () => [-5.2, 0, 5.2].flatMap((y) => [-5.2, 0, 5.2].flatMap((x) => [rect(x, y, 4.2, 4.2), tick(x, y, 1.3)])),
  gauge: () => [arc(0, -3, 7, 1.9, 0, 180), arc(0, -3, 7, 1.9, 0, 55, LIGHT), ...[30, 60, 90, 120, 150].map((a) => arc(0, -3, 5, 1.1, a - 3, a + 3)), path([[0, -3], [3.6, 2]], 1.3, RAISED), disc(0, -3, 1.6, RAISED), rect(0, -6.2, 8, 1.1)],
  atom: () => {
    const orbit = (turn: number): Point[] =>
      Array.from({ length: 37 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2
        const x = Math.cos(a) * 7.6
        const y = Math.sin(a) * 2.9
        return [x * Math.cos(turn) - y * Math.sin(turn), x * Math.sin(turn) + y * Math.cos(turn)]
      })
    return [...[0, Math.PI / 3, -Math.PI / 3].map((turn) => path(orbit(turn), 0.9)), disc(0, 0, 1.9, LIGHT)]
  },
  compass: () => [path([[0, 5.4], [-5.2, -6.8]], 1.8), path([[0, 5.4], [5.2, -6.8]], 1.8), disc(0, 5.6, 2.1, RAISED), disc(0, 5.6, 0.8, LIGHT), arc(0, 1, 6.6, 0.9, 215, 325, LIGHT)],
  play: () => [...browser(), area([[-2.4, 2.6], [-2.4, -4.6], [4, -1]], LIGHT)],
  verified: () => [...shield(), tick(0, 0, 3.2)],
  eyes: () => [area([[-8, 0], [-4.6, 3.6], [0, 5], [4.6, 3.6], [8, 0], [4.6, -3.6], [0, -5], [-4.6, -3.6]]), disc(0, 0, 3.4, CUT), disc(0, 0, 1.5, LIGHT)],
  cursor: () => [...browser(), area([[-1.4, 2.6], [5.6, -2.4], [2.4, -3], [4, -6.6], [1.6, -7.4], [0.2, -3.8], [-1.8, -5.8]], { z: 1.5, glow: 0.4 })],
  push: () => [area([[0, 8], [6, 2], [2.2, 2], [2.2, -3.4], [-2.2, -3.4], [-2.2, 2], [-6, 2]], LIGHT), path([[-7, -2.6], [-7, -6.8], [7, -6.8], [7, -2.6]], 1.6)],
  link: () => [arc(-3.2, -3.2, 3.6, 1.9), arc(3.2, 3.2, 3.6, 1.9, 0, 360, RAISED), path([[-1.4, -1.4], [1.4, 1.4]], 1.7, LIGHT)],
  sync: () => [arc(0, 0, 6, 1.9, 20, 160, LIGHT), arc(0, 0, 6, 1.9, 200, 340), area([[8, 2.6], [5.2, -1.4], [2.8, 3.4]], LIGHT), area([[-8, -2.6], [-5.2, 1.4], [-2.8, -3.4]])],
  branches,
  envelope: () => [rect(0, 0, 16, 11.4), path([[-7.2, 4.8], [0, -1], [7.2, 4.8]], 1.1, CUT), disc(5.6, -3.4, 1.6, LIGHT)],
  box: () => [
    rect(-2.6, 3.2, 3.6, 3.6, RAISED),
    rect(2.2, 4.8, 3.2, 3.2, LIGHT),
    area([[-5.8, 1.4], [-8.2, 4.2], [-4.6, 5], [-2.6, 1.4]], { z: 0.2, glow: 0 }),
    area([[5.8, 1.4], [8.2, 4.2], [5.4, 5.2], [3, 1.4]], { z: 0.2, glow: 0 }),
    rect(0, -3.2, 11.6, 9.2, { z: 1.2, glow: 0 }),
    rect(0, 0.9, 11.6, 1, { z: 1.3, glow: -0.97 }),
    tick(0, -3.6, 2.2, { z: 1.7, glow: 0.7 }),
  ],
  blueprint: () => [rect(0, 0, 16, 12.4, GLASS), path([[-6, 4], [-1, 4], [-1, -1], [4, -1], [4, -4]], 1.1), disc(-6, 4, 1.5, RAISED), disc(-1, -1, 1.5, RAISED), disc(4, -4, 1.5, LIGHT), rect(4, 4, 4, 2.4)],
  code: () => [path([[-3.6, 5], [-7.6, 0], [-3.6, -5]], 1.8), path([[3.6, 5], [7.6, 0], [3.6, -5]], 1.8), path([[1.4, 6], [-1.4, -6]], 1.6, LIGHT)],
  flask: () => [area([[-2, 7.4], [2, 7.4], [2, 2.4], [6.4, -6.4], [5, -8], [-5, -8], [-6.4, -6.4], [-2, 2.4]]), area([[-3.4, -1.6], [3.4, -1.6], [5.2, -6], [4.4, -6.8], [-4.4, -6.8], [-5.2, -6]], LIGHT), rect(0, 7.6, 5.4, 1.2, RAISED)],
  bug: () => [
    ...[-3.2, 0, 3.2].flatMap((y) => [path([[0, y - 0.6], [-5.4, y], [-7.2, y - 1.6]], 0.9), path([[0, y - 0.6], [5.4, y], [7.2, y - 1.6]], 0.9)]),
    path([[-3, 7.8], [-1.2, 4.6]], 0.8),
    path([[3, 7.8], [1.2, 4.6]], 0.8),
    disc(0, 4, 2.4, RAISED),
    oval(0, -2.2, 4.2, 5.4, RAISED),
    rect(0, -2.6, 0.7, 9, CUT),
    disc(-2, -1.4, 0.9, LIGHT),
    disc(2, -3.6, 0.9, LIGHT),
  ],
  accessible: () => [arc(0, 0, 7.2, 1.3), disc(0, 4.2, 1.5, LIGHT), path([[-4.4, 1.6], [0, 0.8], [4.4, 1.6]], 1.4, LIGHT), path([[0, 0.8], [0, -1.8], [-2.4, -5]], 1.4, LIGHT), path([[0, -1.8], [2.4, -5]], 1.4, LIGHT)],
  sunrise: () => [arc(0, -2.4, 3.8, 7.6, 0, 180, LIGHT), rect(0, -3.4, 16, 1.2), ...[25, 60, 90, 120, 155].map((a) => path([[Math.cos((a * Math.PI) / 180) * 6, -2.4 + Math.sin((a * Math.PI) / 180) * 6], [Math.cos((a * Math.PI) / 180) * 8.4, -2.4 + Math.sin((a * Math.PI) / 180) * 8.4]], 0.9))],
  chat: () => [rect(0, 1.2, 15.4, 11), area([[-4, -4], [-6, -8], [0.6, -4]]), ...[-4, 0, 4].map((x) => disc(x, 1.2, 1.2, LIGHT))],
  guard: () => [...shield(), ...placed(lock(), 0.56, 0, 0, 0.6)],
  pencil: () => [area([[-7.6, -7.6], [-6.4, -2.8], [4.6, 8], [8, 4.6], [-2.8, -6.4]]), path([[2.8, 4.8], [5.2, 2.4]], 1, CUT), area([[-7.6, -7.6], [-6.4, -2.8], [-2.8, -6.4]], LIGHT)],
  warning: () => [area([[0, 8], [8.4, -6.8], [-8.4, -6.8]]), rect(0, 0.6, 1.7, 6.2, CUT), disc(0, -4.4, 1.2, CUT), disc(0, -4.4, 0.6, LIGHT)],
  handback: () => [...placed(person(), 0.66, -3.8, 0.4), area([[8, 4.6], [8, 2], [4, 2], [4, 0], [0.4, 3.3], [4, 6.6], [4, 4.6]], LIGHT)],
  bell: () => [area([[-7, -4.4], [-4.8, -1.8], [-4.4, 2.6], [-2, 5.6], [2, 5.6], [4.4, 2.6], [4.8, -1.8], [7, -4.4]]), disc(0, 6.8, 1.3), arc(0, -5.2, 2, 1.6, 180, 360, LIGHT)],
  gate: () => [rect(-5.8, -0.6, 3, 13), rect(5.8, -0.6, 3, 13), rect(0, 6.2, 14.6, 2.8, RAISED), rect(0, -7.6, 16, 1.1), tick(0, -0.8, 3.2)],
  flag: () => [rect(-5, 0, 1.4, 15.6), area([[-4.2, 7.4], [7, 7.4], [4.4, 3.8], [7, 0.2], [-4.2, 0.2]]), ...[0, 1, 2, 3].flatMap((c) => [0, 1].map((r) => rect(-2.8 + c * 2.2, 5.6 - r * 3.6 - (c % 2) * 1.8, 2.2, 1.8, LIGHT)))],
  gear,
  lock,
  ruler: () => [area([[-8, -3.6], [5, 8], [8.2, 4.4], [-4.8, -7.2]]), ...Array.from({ length: 7 }, (_, i) => path([[-6.2 + i * 1.8, -2.8 + i * 1.6], [-5 + i * 1.8 + (i % 2) * 0.8, -4.2 + i * 1.6 - (i % 2) * 0.9]], 0.6, i % 2 ? LIGHT : CUT))],
  magnifier,
  scope: () => [arc(0, 0, 7, 1.3), arc(0, 0, 4, 1.2), disc(0, 0, 1.6, LIGHT)],
  tag: () => [area([[-8, 5.6], [2, 5.6], [8, 0], [2, -5.6], [-8, -5.6]]), disc(3.4, 0, 1.4, CUT), rect(-3.6, 1.2, 5.6, 1, LIGHT), rect(-4.4, -1.4, 4, 1, CUT)],
  bolt: () => [bolt(0, 0, 8)],
  pin: () => [disc(0, 2.6, 5.2), area([[-4.8, 0.6], [4.8, 0.6], [0, -8]]), disc(0, 2.6, 2.2, LIGHT)],
  tree: () => [path([[-5.4, 5], [-5.4, -5.4], [2, -5.4]], 1), path([[-5.4, 0], [2, 0]], 1), rect(-4, 5.6, 7, 3.4, RAISED), rect(3.8, 0, 7, 3.4), rect(3.8, -5.4, 7, 3.4, LIGHT)],
  signal: () => [rect(0, 0, 15.4, 12.4, GLASS), path([[-7, -1], [-3.8, -1], [-2, 3.8], [0.8, -4.4], [2.6, 0.6], [7, 0.6]], 1.2, LIGHT)],
  fullstack: () => [...placed([...browser(), rect(0, -1, 11, 3)], 0.66, -2.6, 2.8), ...placed([...browser(), rect(-4.6, -1.2, 3, 8, RAISED), ...[2, 4, 6].map((h, i) => rect(0 + i * 2.6, -5 + h / 2, 1.6, h, LIGHT))], 0.66, 2.6, -2.8, 1.2)],
  clock: () => [arc(0, 0, 7, 1.6), path([[0, 4], [0, 0], [3.4, -2]], 1.4, LIGHT)],
} satisfies Record<string, () => Mark[]>

export type SignName = keyof typeof SIGNS

export const FRAMES = {
  /** The sign alone, as big as the stage. */
  plain: (marks: Mark[]): Mark[] => marks,
  /** A colleague holding the tool of the role. */
  agent: (marks: Mark[]): Mark[] => [...placed(person(), 1, -2.4, 0), disc(4.9, -3.2, 4.9, { z: 1.2, glow: -0.9 }), arc(4.9, -3.2, 4.9, 0.8, 0, 360, { z: 1.5, glow: 0 }), ...placed(marks, 0.43, 4.9, -3.2, 1.4)],
  /** A page of the handbook with what it is about. */
  rule: (marks: Mark[]): Mark[] => [...sheet(), ...placed(marks, 0.52, 0, 0.8, 0.6), ...[-5, -6.4].map((y, i) => rect(i ? -1.4 : 0, y, i ? 6 : 9, 0.6, LIGHT))],
  /** A ring of the session, with what happens at that moment. */
  hook: (marks: Mark[]): Mark[] => [arc(0, 0, 8.6, 1.1), ...[0, 1, 2, 3].map((i) => arc(0, 0, 8.6, 1.1, i * 90 + 8, i * 90 + 26, LIGHT)), ...placed(marks, 0.64, 0, 0, 0.4)],
} satisfies Record<string, (marks: Mark[]) => Mark[]>

export type FrameName = keyof typeof FRAMES
