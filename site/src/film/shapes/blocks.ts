import { Euler, Quaternion } from 'three'

export type Vec3 = [x: number, y: number, z: number]
export type Rotation = [x: number, y: number, z: number, w: number]

/** Floats per block: position + glow, rotation, size + spin. */
export const STRIDE = 12
export const TAU = Math.PI * 2
/** Every subject is centred this far above the floor. */
export const CENTRE = 10

export interface Block {
  at: Vec3
  size: Vec3
  /** Above zero it shines; below zero it is dark glass. */
  glow: number
  rotation: Rotation
  /** Radians per second around the block's own z axis, through the centre. */
  spin: number
  /** Never thinned out: it carries the meaning of the shape. */
  keep: boolean
  /** Position in the morph order, where two shapes must match piece by piece. */
  order?: number
  group?: number
}

export interface Shape {
  blocks: Block[]
  /** How the blocks line up with those of the shape before and after. */
  sort?: (block: Block) => number
  /** How far the spare blocks drift. */
  dust?: number
  /** Points in space that carry a label. */
  anchors?: Vec3[]
}

export function block(at: Vec3, size: Vec3, options: Partial<Omit<Block, 'at' | 'size'>> = {}): Block {
  return { at, size, glow: 0, rotation: [0, 0, 0, 1], spin: 0, keep: false, ...options }
}

const euler = new Euler()
const quaternion = new Quaternion()

export function rotation(x = 0, y = 0, z = 0): Rotation {
  const { x: qx, y: qy, z: qz, w } = quaternion.setFromEuler(euler.set(x, y, z))
  return [qx, qy, qz, w]
}

/** A seeded generator, so every visit and every test sees the same shapes. */
export function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
