import { block, CENTRE, seeded, TAU, type Block, type Shape } from '../blocks.ts'
import type { Mark } from './draw.ts'
import { FRAMES, SIGNS, type FrameName, type SignName } from './signs.ts'

export type EmblemName = `emblem:${FrameName}/${SignName}`

const EXTENT = 9.4
const TILE = 0.34
/** The signs are drawn small; on the stage they stand as tall as a screen does. */
const SCALE = 0.9

/** Cuts a drawing into tiles: the topmost mark colours each, and its thickness is blocks behind it. */
export function tiles(marks: readonly Mark[], tileScale: number, scale = SCALE): Block[] {
  const tile = TILE * tileScale
  const size = tile * scale
  const blocks: Block[] = []
  for (let y = -EXTENT + tile / 2; y < EXTENT; y += tile) {
    for (let x = -EXTENT + tile / 2; x < EXTENT; x += tile) {
      let top: Mark | undefined
      for (const mark of marks) if (mark.covers(x, y) && (!top || mark.z >= top.z)) top = mark
      if (!top) continue
      const at = (z: number): Block['at'] => [x * scale, CENTRE + y * scale, z]
      blocks.push(block(at(top.z), [size * 0.94, size * 0.94, 0.55], { glow: top.glow, keep: true }))
      blocks.push(block(at(top.z - 0.75), [size * 0.9, size * 0.9, 0.8]))
    }
  }
  return blocks
}

export function isEmblem(name: string): name is EmblemName {
  const [frame, sign] = name.startsWith('emblem:') ? name.slice(7).split('/') : []
  return frame !== undefined && sign !== undefined && Object.hasOwn(FRAMES, frame) && Object.hasOwn(SIGNS, sign)
}

/** A sign built of blocks, over a little of the city every shape comes from. */
export function emblem(name: EmblemName, tileScale: number): Shape {
  const [frame, sign] = name.slice(7).split('/') as [FrameName, SignName]
  const blocks = tiles(FRAMES[frame](SIGNS[sign]()), tileScale)
  const random = seeded(name.length)
  for (let i = 0; i < 520; i++) {
    const angle = random() * TAU
    const radius = 17 + random() * 22
    const height = 0.3 + random() ** 3 * 3
    blocks.push(block([Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius], [0.9, height, 0.9], { glow: random() > 0.985 ? 0.3 : 0 }))
  }
  return { blocks, dust: 26 }
}
