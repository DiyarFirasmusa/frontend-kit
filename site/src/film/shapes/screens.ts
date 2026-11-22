import { block, CENTRE, rotation, seeded, type Block, type Shape } from './blocks.ts'

const WIDTH = 22
const HEIGHT = 14

interface PanelStyle {
  z?: number
  depth?: number
  glow?: number
  /** The tile size. */
  tile?: number
}

/** Collects panels, each cut into tiles. */
class Screen {
  readonly blocks: Block[] = []
  private readonly tileScale: number

  constructor(tileScale: number) {
    this.tileScale = tileScale
  }

  panel(group: number, [x, y, width, height]: [number, number, number, number], style: PanelStyle = {}): void {
    const { z = 0, depth = 0.4, glow = 0, tile = 0.5 } = style
    const columns = Math.max(1, Math.round(width / (tile * this.tileScale)))
    const rows = Math.max(1, Math.round(height / (tile * this.tileScale)))
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const at: Block['at'] = [x + ((c + 0.5) / columns - 0.5) * width, CENTRE + y + ((r + 0.5) / rows - 0.5) * height, z]
        this.blocks.push(
          block(at, [(width / columns) * 0.97, (height / rows) * 0.97, depth], { glow, group, keep: true, order: this.blocks.length }),
        )
      }
    }
  }

  window(): void {
    this.panel(0, [0, 0, WIDTH, HEIGHT], { z: -0.7, depth: 0.45, glow: -0.55 })
    this.panel(1, [0, HEIGHT / 2 - 0.6, WIDTH, 1.2], { z: -0.1, depth: 0.5, tile: 0.4 })
    for (let i = 0; i < 3; i++) {
      this.panel(1, [-WIDTH / 2 + 0.9 + i * 0.75, HEIGHT / 2 - 0.6, 0.36, 0.36], { z: 0.25, depth: 0.2, glow: 0.7, tile: 1 })
    }
    this.panel(1, [1, HEIGHT / 2 - 0.6, WIDTH * 0.42, 0.42], { z: 0.22, depth: 0.2, glow: -0.85 })
  }
}

function websiteBlocks(tileScale: number): Block[] {
  const screen = new Screen(tileScale)
  screen.window()
  screen.panel(2, [-9, 4.5, 1.2, 1.2], { z: 0.2, depth: 0.5, glow: 0.6, tile: 1.2 })
  for (let i = 0; i < 4; i++) screen.panel(3, [-1.6 + i * 2.7, 4.5, 1.9, 0.22], { z: 0.1, depth: 0.25 })
  screen.panel(4, [9, 4.5, 2.6, 0.95], { z: 0.2, depth: 0.5, glow: 0.5 })
  screen.panel(5, [-5.4, 2, 8.6, 1.1], { z: 0.2, depth: 0.6, tile: 0.37 })
  screen.panel(5, [-6.4, 0.5, 6.6, 1.1], { z: 0.2, depth: 0.6, tile: 0.37 })
  screen.panel(6, [-5.8, -0.8, 7.8, 0.22], { z: 0.1, depth: 0.25 })
  screen.panel(7, [5.3, 0.6, 9.4, 5.6], { z: 0.1, depth: 0.7, glow: -0.8, tile: 0.4 })
  for (let i = 0; i < 7; i++) {
    const box: [number, number, number, number] = [1.6 + i * 1.22, -1.5 + Math.sin(i * 0.8) * 0.5 + i * 0.12, 0.8, 1.2 + i * 0.36]
    screen.panel(8, box, { z: 0.75, depth: 0.5, tile: 0.4 })
  }
  screen.panel(8, [8.5, 2.3, 1.1, 1.1], { z: 0.8, depth: 0.3, glow: 0.8, tile: 1.2 })
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 7.1
    screen.panel(9 + i, [x, -4.4, 6.5, 3.3], { z: 0.05, glow: -0.25, tile: 0.45 })
    screen.panel(9 + i, [x, -3.7, 5.6, 1.2], { z: 0.45, glow: -0.9 })
    screen.panel(9 + i, [x - 0.9, -5.2, 3.8, 0.22], { z: 0.4, depth: 0.2, glow: i === 1 ? 0.8 : 0 })
  }
  return screen.blocks
}

function dashboardBlocks(tileScale: number): Block[] {
  const screen = new Screen(tileScale)
  screen.window()
  screen.panel(2, [-8.8, -0.7, 4, 12], { z: 0.1, depth: 0.5, glow: -0.85, tile: 0.45 })
  for (let i = 0; i < 7; i++) screen.panel(3, [-8.8, 3.6 - i * 1.35, 2.9, 0.45], { z: 0.5, depth: 0.3, glow: i === 0 ? 0.7 : 0 })
  for (let i = 0; i < 3; i++) {
    const x = -3.5 + i * 5.9
    screen.panel(4 + i, [x, 3.9, 5.4, 2.4], { z: 0.15, depth: 0.5, tile: 0.4 })
    screen.panel(4 + i, [x - 0.8, 3.9, 2.6, 0.5], { z: 0.55, depth: 0.3, glow: i === 1 ? 0.8 : -0.9 })
  }
  for (let i = 0; i < 12; i++) {
    const height = 1 + ((i * 7) % 5) * 0.35 + i * 0.16
    screen.panel(7, [-5.2 + i * 1.36, -1.8 + height / 2, 0.8, height], { z: 0.4, depth: 0.8, glow: i === 9 ? 0.45 : 0, tile: 0.4 })
  }
  for (let i = 0; i < 3; i++) {
    const y = -3 - i * 1.4
    screen.panel(8 + i, [2.1, y, 16.6, 1.1], { z: 0.1, glow: -0.6, tile: 0.45 })
    screen.panel(8 + i, [-3.6, y, 4, 0.24], { z: 0.4, depth: 0.2 })
    screen.panel(8 + i, [2.6, y, 3, 0.24], { z: 0.4, depth: 0.2 })
    screen.panel(8 + i, [8.6, y, 1.9, 0.36], { z: 0.4, depth: 0.2, glow: 0.55 })
  }
  return screen.blocks
}

const inOrder = (blocks: Block[]): Shape => ({ blocks, sort: (b) => b.order ?? 0, dust: 32 })

export const website = (tileScale: number): Shape => inOrder(websiteBlocks(tileScale))
export const dashboard = (tileScale: number): Shape => inOrder(dashboardBlocks(tileScale))

/** The same interface after Claude guessed: each piece out of place and cracked. */
export function broken(tileScale: number): Shape {
  const random = seeded(41)
  const moves = Array.from({ length: 16 }, () => [(random() - 0.5) * 9, (random() - 0.5) * 6, random() * 6 - 1, (random() - 0.5) * 1.1] as const)
  moves[0] = [0, 0, -2, 0.06]
  return inOrder(
    dashboardBlocks(tileScale).map((piece) => {
      const [dx, dy, dz, angle] = moves[piece.group ?? 0]!
      const x = piece.at[0]
      const y = piece.at[1] - CENTRE
      const crumb = random() < 0.09
      const glow = crumb ? (random() < 0.3 ? 0.6 : 0) : Math.min(piece.glow, 0.5)
      return {
        ...piece,
        glow,
        at: [
          x * Math.cos(angle) - y * Math.sin(angle) + dx + (crumb ? (random() - 0.5) * 7 : 0),
          CENTRE + x * Math.sin(angle) + y * Math.cos(angle) + dy + (crumb ? (random() - 0.5) * 5 : 0),
          piece.at[2] + dz + (crumb ? random() * 7 : random() * 0.35),
        ],
        rotation: crumb ? rotation(random() * 6, random() * 6, random() * 6) : rotation(0, 0, angle),
      }
    }),
  )
}

/** Three sheets in depth: install, set up, build. */
export function layers(tileScale: number): Shape {
  return inOrder(
    dashboardBlocks(tileScale).map((piece) => {
      const group = piece.group ?? 0
      const sheet = group < 2 ? 0 : group < 7 ? 1 : 2
      return { ...piece, at: [piece.at[0], piece.at[1], piece.at[2] + (sheet - 1) * 7] }
    }),
  )
}

/** A site and its admin, side by side. */
export function both(tileScale: number): Shape {
  const place = (blocks: Block[], x: number, z: number, yaw: number, first: number): Block[] => {
    const scale = 0.64
    return blocks.map((piece, i) => ({
      ...piece,
      order: first + i,
      at: [
        x + (piece.at[0] * Math.cos(yaw) + piece.at[2] * Math.sin(yaw)) * scale,
        CENTRE + (piece.at[1] - CENTRE) * scale,
        z + (piece.at[2] * Math.cos(yaw) - piece.at[0] * Math.sin(yaw)) * scale,
      ],
      size: [piece.size[0] * scale, piece.size[1] * scale, piece.size[2] * scale],
      rotation: rotation(0, yaw, 0),
    }))
  }
  // Two screens share the budget of one, so each takes larger tiles.
  const left = websiteBlocks(tileScale * 1.2)
  const right = dashboardBlocks(tileScale * 1.2)
  return inOrder([...place(left, -5.8, -1, 0.5, 0), ...place(right, 5.8, 1, -0.5, left.length)])
}
