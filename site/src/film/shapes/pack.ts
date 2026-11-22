import { block, rotation, seeded, STRIDE, type Block, type Shape } from './blocks.ts'

const MAX_GROWTH = 1.35

/** Fits a shape to exactly `count` blocks: thins the unimportant ones, or adds drifting dust. */
export function pack(shape: Shape, count: number): Float32Array {
  const { blocks, sort = (b) => b.at[1], dust = 28 } = shape
  const random = seeded(blocks.length + 1)
  let chosen: Block[] = blocks
  let growth = 1

  if (blocks.length > count) {
    const kept = blocks.filter((b) => b.keep)
    const spare = blocks.filter((b) => !b.keep)
    // What must be kept alone can exceed a light device's budget: thin that evenly.
    if (kept.length >= count) {
      chosen = Array.from({ length: count }, (_, i) => kept[Math.floor((i * kept.length) / count)]!)
    } else {
      for (let i = spare.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[spare[i], spare[j]] = [spare[j]!, spare[i]!]
      }
      const room = count - kept.length
      growth = Math.min(MAX_GROWTH, Math.cbrt(spare.length / room))
      chosen = [...kept, ...spare.slice(0, room)]
    }
  }

  const ordered = [...chosen].sort((a, b) => sort(a) - sort(b))
  const data = new Float32Array(count * STRIDE)
  for (let i = 0; i < count; i++) {
    let piece = ordered[i]
    if (!piece) {
      const size = 0.025 + random() * 0.05
      piece = block([(random() - 0.5) * dust * 2, 10 + (random() - 0.5) * dust, (random() - 0.5) * dust * 2], [size, size, size], {
        glow: random() > 0.9 ? 0.8 : 0,
        rotation: rotation(random() * 6, random() * 6, random() * 6),
        keep: true,
      })
    }
    const grow = piece.keep ? 1 : growth
    data.set(piece.at, i * STRIDE)
    data[i * STRIDE + 3] = piece.glow
    data.set(piece.rotation, i * STRIDE + 4)
    data.set([piece.size[0] * grow, piece.size[1] * grow, piece.size[2] * grow, piece.spin], i * STRIDE + 8)
  }
  return data
}
