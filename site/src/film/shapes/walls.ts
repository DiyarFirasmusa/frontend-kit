import { block, rotation, type Block, type Shape, type Vec3 } from './blocks.ts'

const ROWS = 3
const PLATE_ANGLE = 0.225

/** A point on a wall curved around the camera. */
const onArc = (angle: number, radius: number) => (u: number, y: number, out: number): Vec3 => [
  Math.sin(angle) * (radius - out) + Math.cos(angle) * u,
  y,
  -Math.cos(angle) * (radius - out) + Math.sin(angle) * u,
]

/** One plate per skill; the page writes its name on it. */
export function skillWall(amount: number, tileScale: number): Shape {
  const blocks: Block[] = []
  const anchors: Vec3[] = []
  const columns = Math.ceil(amount / ROWS)
  const across = tileScale > 1 ? 7 : 10
  const down = tileScale > 1 ? 4 : 6

  for (let i = 0; i < amount; i++) {
    const angle = ((i % columns) - (columns - 1) / 2) * PLATE_ANGLE
    const centre = 11.5 - Math.floor(i / columns) * 3.7
    const at = onArc(angle, 24)
    const turn = rotation(0, -angle, 0)
    for (let c = 0; c < across; c++) {
      for (let r = 0; r < down; r++) {
        const rim = c === 0 || c === across - 1 || r === 0 || r === down - 1
        const width = 4.9 / across
        const height = 3.12 / down
        blocks.push(
          block(at((c - (across - 1) / 2) * width, centre + (r - (down - 1) / 2) * height, rim ? 0.2 : 0), [width * 0.98, height * 0.98, rim ? 0.7 : 0.4], {
            glow: rim ? 0 : -0.85,
            rotation: turn,
            keep: true,
          }),
        )
      }
    }
    blocks.push(block(at(0, centre - 1.25, 0.62), [3.6, 0.05, 0.05], { glow: 0.9, rotation: turn, keep: true }))
    anchors.push(at(0, centre + 0.05, 0.8))
  }
  return { blocks, anchors, sort: (b) => Math.atan2(b.at[0], -b.at[2]) }
}

/** One tablet per group of rules, with a line of light for each rule. */
export function ruleTablets(groups: readonly number[], tileScale: number): Shape {
  const blocks: Block[] = []
  const anchors: Vec3[] = []
  const tile = 0.5 * tileScale
  const columns = Math.round(5.5 / tile)
  const depth = tileScale > 1 ? 1 : 2

  groups.forEach((lines, i) => {
    const angle = (i - (groups.length - 1) / 2) * 0.36
    const height = 5 + lines * 0.75
    const at = onArc(angle, 21)
    const turn = rotation(0, -angle, 0)
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < Math.round(height / tile); r++) {
        for (let d = 0; d < depth; d++) {
          const glass = d === 0 && c > 0 && c < columns - 1
          blocks.push(
            block(at((c - (columns - 1) / 2) * tile, (r + 0.5) * tile, -d * 0.5), [tile * 0.98, tile * 0.98, 0.5], {
              glow: glass ? -0.5 : 0,
              rotation: turn,
              keep: true,
            }),
          )
        }
      }
    }
    for (let n = 0; n < lines; n++) {
      blocks.push(block(at(0, height - 1.5 - n * 0.78, 0.4), [3.3 - (n % 3) * 0.7, 0.09, 0.06], { glow: 0.9, rotation: turn, keep: true }))
    }
    anchors.push(at(0, height + 1, 0.5))
  })
  return { blocks, anchors, dust: 26 }
}

/** One guardian per agent, with a slit of light for eyes. */
export function council(amount: number): Shape {
  const blocks: Block[] = []
  const anchors: Vec3[] = []
  const middle = (amount - 1) / 2

  for (let i = 0; i < amount; i++) {
    const angle = ((i - middle) / Math.max(1, amount - 1)) * 2.05
    const at = onArc(angle, 17)
    const turn = rotation(0, -angle, 0)
    const scale = 1.24 - (Math.abs(i - middle) / Math.max(1, middle)) * 0.34
    const height = 11.5 * scale
    for (let row = 0; row < 25; row++) {
      const k = row / 24
      // Cloak, shoulders, neck, head.
      const width = (k < 0.68 ? 3.5 - k * 2.1 : k < 0.78 ? 3 : k < 0.82 ? 0.7 : 1.55) * scale
      const columns = Math.max(2, Math.round(width / 0.46))
      for (let c = 0; c < columns; c++) {
        for (let d = 0; d < 3; d++) {
          const u = (c / (columns - 1) - 0.5) * (width - 0.4)
          const out = (d - 1) * 0.5 + Math.cos((u / width) * Math.PI) * 0.3
          blocks.push(block(at(u, ((row + 0.5) / 25) * height, out), [(width / columns) * 0.98, (height / 25) * 0.98, 0.5], { rotation: turn }))
        }
      }
    }
    blocks.push(
      block(at(0, height * 0.905, 1.2), [1.1 * scale, 0.09, 0.1], { glow: 1.4, rotation: turn, keep: true }),
      block(at(0, height * 0.45, 1.22), [0.05, height * 0.28, 0.08], { glow: 0.7, rotation: turn, keep: true }),
    )
    anchors.push(at(0, height + 0.9 + (i % 2) * 1.2, 0))
  }
  return { blocks, anchors }
}
