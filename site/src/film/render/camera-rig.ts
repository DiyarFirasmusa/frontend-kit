import { PerspectiveCamera, Vector2, Vector3 } from 'three'
import { SHOTS } from '../direction.ts'
import type { Vec3 } from '../shapes/blocks.ts'
import type { ShapeName } from '../shapes/index.ts'
import { clamp, mix } from '../timeline.ts'

export type Layout = 'side' | 'high' | 'centre'

export interface Framing {
  from: ShapeName
  to: ShapeName
  hold: number
  /** The eased way between the two scenes. */
  t: number
  layouts: [Layout, Layout]
}

export interface Screen {
  width: number
  height: number
}

export interface Projected {
  x: number
  y: number
  behind: boolean
  distance: number
}

const NARROW = 820
const PORTRAIT_REFERENCE = 0.8

/** Flies the shots and keeps the subject out from under the words. */
export class CameraRig {
  readonly camera = new PerspectiveCamera(40, 1, 0.1, 240)
  private readonly eye = new Vector3()
  private readonly target = new Vector3()
  private readonly nextEye = new Vector3()
  private readonly nextTarget = new Vector3()
  private readonly end = new Vector3()
  private readonly projected = new Vector3()
  private readonly pointer = new Vector2()
  private readonly rtl: boolean
  private screen: Screen = { width: 1, height: 1 }

  constructor(rtl: boolean) {
    this.rtl = rtl
  }

  private aim(shape: ShapeName, t: number, eye: Vector3, target: Vector3): void {
    const { from, to, look, lookTo } = SHOTS[shape]
    eye.fromArray(from).lerp(this.end.fromArray(to), t)
    target.fromArray(look).lerp(this.end.fromArray(lookTo), t)
  }

  private lean(layout: Layout): [number, number] {
    if (this.screen.width < NARROW) return [0, layout === 'centre' ? 0 : 0.17]
    if (layout === 'side') return [this.rtl ? -0.21 : 0.21, 0]
    if (layout === 'high') return [0, -0.12]
    return [0, 0]
  }

  update(framing: Framing, screen: Screen, live: { time: number; delta: number; speed: number; hit: number; aim: Vector2 }): Vector3 {
    const { from, to, hold, t, layouts } = framing
    const { time, delta, speed, hit, aim } = live
    this.screen = screen
    const { width, height } = screen
    const { eye, target, camera } = this

    this.aim(from, hold, eye, target)
    let fov = SHOTS[from].fov
    if (t > 0) {
      this.aim(to, 0, this.nextEye, this.nextTarget)
      eye.lerp(this.nextEye, t)
      target.lerp(this.nextTarget, t)
      fov = mix(fov, SHOTS[to].fov, t)
    }

    this.pointer.lerp(aim, 1 - Math.exp(-delta * 4))
    const shake = hit * 0.45 + (from === 'broken' ? 0.015 : 0)
    eye.x += this.pointer.x * 1.1 + Math.sin(time * 37) * shake
    eye.y = Math.max(0.6, eye.y + this.pointer.y * 0.6 + Math.cos(time * 29) * shake + Math.sin(time * 0.5) * 0.12)

    const aspect = width / height
    let widen = 1
    if (aspect < 1) widen = Math.max(1, mix(SHOTS[from].phone, SHOTS[to].phone, t) * Math.min(1, PORTRAIT_REFERENCE / aspect))
    camera.fov = (Math.atan(Math.tan((fov * Math.PI) / 360) * widen) * 360) / Math.PI
    camera.aspect = aspect
    camera.position.copy(eye)
    // Leans into fast scrolling.
    camera.up.set(clamp(speed, -1, 1) * 0.035, 1, 0)
    camera.lookAt(target)

    const a = this.lean(layouts[0])
    const b = this.lean(layouts[1])
    camera.setViewOffset(width, height, -mix(a[0], b[0], t) * width, mix(a[1], b[1], t) * height, width, height)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    return eye
  }

  /** Where a point in space lands on the screen, in CSS pixels. */
  project(point: Vec3): Projected {
    const p = this.projected.fromArray(point)
    const distance = p.distanceTo(this.eye)
    p.project(this.camera)
    return { x: (p.x + 1) * 0.5 * this.screen.width, y: (1 - p.y) * 0.5 * this.screen.height, behind: p.z > 1, distance }
  }
}
