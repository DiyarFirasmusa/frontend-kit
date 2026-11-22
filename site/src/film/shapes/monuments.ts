import { block, CENTRE, rotation, seeded, TAU, type Block, type Shape, type Vec3 } from './blocks.ts'
import { tiles } from './emblems/build.ts'
import { kitMarks } from './emblems/signs.ts'

const ring = (angle: number, radius: number, z: number): Vec3 => [Math.cos(angle) * radius, CENTRE + Math.sin(angle) * radius, z]

/** Where the opening shot comes from. */
export function storm(count: number): Shape {
  const random = seeded(5)
  const blocks = Array.from({ length: count }, () => {
    const angle = random() * TAU
    const radius = 9 + random() * 30
    const size = 0.08 + random() ** 3 * 0.8
    return block([Math.cos(angle) * radius, CENTRE + (random() - 0.5) * 22, Math.sin(angle) * radius], [size, size, size], {
      glow: random() > 0.975 ? 1 : 0,
      rotation: rotation(random() * 6, random() * 6, random() * 6),
      spin: 0.05,
    })
  })
  return { blocks, sort: (b) => Math.atan2(b.at[2], b.at[0]) }
}

/** The identity: an interface still on its kit frame, over the city it builds. */
export function mark(tileScale: number): Shape {
  const blocks: Block[] = tiles(kitMarks(), tileScale, 0.84)
  for (let i = 0; i < 260; i++) {
    const angle = (i / 260) * TAU
    blocks.push(block(ring(angle, 11.3, -2), [0.05, 0.3, 0.05], { glow: 1.5, rotation: rotation(0, 0, angle), spin: 0.03, keep: true }))
  }

  const random = seeded(31)
  for (let i = 0; i < 900; i++) {
    const angle = random() * TAU
    const radius = 14 + random() * 24
    const height = 0.4 + random() ** 3 * 4
    blocks.push(block([Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius], [0.9, height, 0.9], { glow: random() > 0.985 ? 0.3 : 0 }))
  }
  return { blocks, dust: 26 }
}

/** A vault door: rings of plates, with bolts across its face. */
export function vault(tileScale: number): Shape {
  const blocks: Block[] = []
  const plate = 0.52 * tileScale
  for (let radius = 1.5; radius < 10.4; radius += plate) {
    const amount = Math.round((TAU * radius) / (plate * 1.08))
    const edge = radius > 9.2
    const band = Math.floor(radius / 2.2)
    for (let i = 0; i < amount; i++) {
      const angle = (i / amount) * TAU
      const groove = Math.abs((((angle / TAU) * 12 + band * 0.5) % 1) - 0.5) > 0.46
      for (let d = 0; d < (edge ? 3 : 2); d++) {
        const z = (band % 2) * 0.35 - d * 0.55 + (edge ? 1.1 : 0) - (groove ? 0.3 : 0)
        blocks.push(
          block(ring(angle, radius, z), [plate * 0.96, plate, 0.55], {
            glow: edge && d === 0 && i % 18 === 0 ? 0.65 : 0,
            rotation: rotation(0, 0, angle),
            spin: band % 2 ? 0.035 : -0.025,
            keep: d === 0,
          }),
        )
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TAU
    for (let radius = 1.2; radius < 9; radius += 0.5) {
      for (const side of [-0.28, 0.28]) {
        const [x, y] = ring(angle, radius, 0)
        blocks.push(
          block([x - Math.sin(angle) * side, y + Math.cos(angle) * side, 1], [0.52, 0.5, 0.5], { rotation: rotation(0, 0, angle), spin: 0.05, keep: true }),
        )
      }
    }
  }
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * TAU
    blocks.push(block(ring(angle, 1.25, 1.35), [0.07, 0.17, 0.1], { glow: 0.9, rotation: rotation(0, 0, angle), keep: true }))
  }
  return { blocks, sort: (b) => Math.hypot(b.at[0], b.at[1] - CENTRE) }
}

/** One arch per hook event, in a straight line. */
export function passage(arches: number, tileScale: number): Shape {
  const random = seeded(29)
  const blocks: Block[] = []
  const anchors: Vec3[] = []
  const gap = 88 / Math.max(1, arches - 1)
  const sides = Math.round(112 / tileScale)
  for (let i = 0; i < arches; i++) {
    const z = 22 - i * gap
    anchors.push([0, CENTRE, z])
    for (let j = 0; j < sides; j++) {
      const angle = (j / sides) * TAU
      const turn = rotation(0, 0, angle)
      for (let d = 0; d < 5; d++) {
        const radius = 6.6 + (d % 2) * 0.5 + (Math.floor(j / 7) % 2) * 0.3
        blocks.push(block(ring(angle, radius, z - d * 0.42), [0.8, 0.36 * tileScale, 0.4], { rotation: turn, spin: i % 2 ? 0.02 : -0.02, keep: d === 0 }))
      }
      if (j % 4 < 3) blocks.push(block(ring(angle, 6.1, z), [0.06, 0.33 * tileScale, 0.08], { glow: 0.85, rotation: turn, spin: 0.05, keep: true }))
    }
  }
  for (let i = 0; i < 90; i++) {
    blocks.push(block(ring(random() * TAU, 5.5, 26 - random() * 100), [0.02, 0.02, 0.7 + random() * 1.4], { glow: 0.25 }))
  }
  return { blocks, anchors, sort: (b) => -b.at[2] }
}
