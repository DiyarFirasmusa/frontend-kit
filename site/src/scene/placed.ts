import { Color, Euler, Quaternion, Vector3, Vector4 } from 'three'
import type { Formation } from './parts.ts'
import { MAX_PARTS } from './formations.ts'

/** A part resolved into world space. */
export class Placed {
  position = new Vector3()
  rotation = new Quaternion()
  shape = new Vector4()
  bevel = 0
  color = new Color()

  copy(other: Placed): void {
    this.position.copy(other.position)
    this.rotation.copy(other.rotation)
    this.shape.copy(other.shape)
    this.bevel = other.bevel
    this.color.copy(other.color)
  }
}

export interface Target {
  x: number
  y: number
  width: number
  height: number
}

export const createBuffer = (): Placed[] => Array.from({ length: MAX_PARTS }, () => new Placed())

const euler = new Euler()
const group = new Quaternion()
const spin = new Quaternion()
const UP = new Vector3(0, 1, 0)

/** Scales a formation into its target and writes its parts; unused slots collapse into the centre. */
export function place(formation: Formation, target: Target, into: Placed[]): void {
  const scale = Math.min(target.width / formation.width, target.height / formation.height)
  group.setFromEuler(euler.set(...formation.tilt))
  into.forEach((placed, i) => {
    const part = formation.parts[i]
    if (!part) {
      placed.position.set(target.x, target.y, 0)
      placed.rotation.copy(group)
      placed.shape.set(0, 0, 0, 0)
      placed.bevel = 0
      return
    }
    const [w, h, d] = part.size
    placed.position.set(...part.at).multiplyScalar(scale).applyQuaternion(group)
    placed.position.x += target.x
    placed.position.y += target.y
    placed.rotation.setFromEuler(euler.set(...part.turn)).premultiply(group)
    placed.shape.set(w, h, d, part.radius * 2).multiplyScalar(scale / 2)
    placed.bevel = 0.11 * scale
    placed.color.set(part.color)
  })
}

export function collapse(target: Target, into: Placed[]): void {
  for (const placed of into) {
    placed.position.set(target.x, target.y, 0)
    placed.shape.set(0, 0, 0, 0)
    placed.bevel = 0
  }
}

/** One part on its way from `from` to `to`: it arcs towards the camera and turns over once. */
export function travel(from: Placed, to: Placed, t: number, index: number, out: Placed): void {
  if (t <= 0 || t >= 1) {
    out.copy(t <= 0 ? from : to)
    return
  }
  const distance = from.position.distanceTo(to.position)
  out.position.lerpVectors(from.position, to.position, t)
  out.position.z += Math.sin(Math.PI * t) * Math.min(2.2, 0.25 + distance * 0.22)
  out.rotation.slerpQuaternions(from.rotation, to.rotation, t)
  spin.setFromAxisAngle(UP, t * Math.PI * 2 * (index % 2 ? 1 : -1))
  out.rotation.multiply(spin)
  out.shape.lerpVectors(from.shape, to.shape, t)
  out.bevel = from.bevel + (to.bevel - from.bevel) * t
  // A part that is appearing takes its colour at once, so it never flashes black.
  if (from.shape.x === 0) out.color.copy(to.color)
  else if (to.shape.x === 0) out.color.copy(from.color)
  else out.color.lerpColors(from.color, to.color, t)
}
