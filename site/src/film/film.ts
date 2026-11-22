import { ACESFilmicToneMapping, Vector2, Vector3, WebGLRenderer } from 'three'
import { MOVES } from './direction.ts'
import { impactAt } from './impact.ts'
import { isSoftwareRenderer, pickQuality, type Quality } from './quality.ts'
import { BlockMesh } from './render/block-mesh.ts'
import { CameraRig, type Layout, type Projected, type Screen } from './render/camera-rig.ts'
import { Picture } from './render/picture.ts'
import { FilmSet } from './render/set.ts'
import { createUniforms, SUN } from './render/uniforms.ts'
import { buildShapes, type BuiltShapes, type Census, type ShapeName } from './shapes/index.ts'
import type { Vec3 } from './shapes/blocks.ts'
import { smoother } from './timeline.ts'

export interface Shot {
  from: ShapeName
  to: ShapeName
  hold: number
  move: number
  layouts: [Layout, Layout]
  time: number
  delta: number
  speed: number
  /** 0 is black, 1 is open. */
  open: number
}

export class Film {
  readonly anchors: BuiltShapes['anchors']
  private readonly renderer: WebGLRenderer
  private readonly uniforms = createUniforms()
  private readonly blocks: BlockMesh
  private readonly set: FilmSet
  private readonly rig: CameraRig
  private readonly picture: Picture
  private readonly canvas: HTMLCanvasElement
  private readonly screen: Screen = { width: 0, height: 0 }
  private readonly pointer = new Vector2()
  private readonly sun = new Vector3()
  private readonly cheaperSteps: (() => void)[]
  private pixelRatio: number
  private touched = 0

  static async create(canvas: HTMLCanvasElement, census: Census, rtl: boolean): Promise<Film> {
    const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    if (isSoftwareRenderer(renderer.getContext())) {
      renderer.dispose()
      throw new Error('WebGL runs in software on this device')
    }
    const quality = pickQuality()
    const shapes = await buildShapes(census, quality.budget)
    const film = new Film(canvas, renderer, shapes, quality, rtl)
    await renderer.compileAsync(film.set.scene, film.rig.camera)
    return film
  }

  private constructor(canvas: HTMLCanvasElement, renderer: WebGLRenderer, shapes: BuiltShapes, quality: Quality, rtl: boolean) {
    this.canvas = canvas
    this.renderer = renderer
    this.anchors = shapes.anchors
    this.pixelRatio = Math.min(devicePixelRatio, quality.pixelRatio)
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05

    this.blocks = new BlockMesh(quality.budget.blocks, shapes.data, this.uniforms)
    this.blocks.load('storm', 'mark')
    this.set = new FilmSet(renderer, this.blocks, this.uniforms, quality)
    this.rig = new CameraRig(rtl)
    this.picture = new Picture(renderer, this.set.scene, this.rig.camera, quality)

    this.cheaperSteps = [
      () => this.setPixelRatio(Math.min(1, this.pixelRatio)),
      () => {
        this.set.dropReflection()
        this.picture.dropEffects()
      },
      () => this.setPixelRatio(0.75),
    ]
  }

  /** Takes the next cheaper step; false when there is none left. */
  cheaper(): boolean {
    const step = this.cheaperSteps.shift()
    step?.()
    return step !== undefined
  }

  point(x: number, y: number): void {
    this.pointer.set((x / this.screen.width) * 2 - 1, 1 - (y / this.screen.height) * 2)
    this.touched = 1
  }

  project(point: Vec3): Projected {
    return this.rig.project(point)
  }

  private setPixelRatio(value: number): void {
    this.pixelRatio = value
    this.screen.width = 0
  }

  private fitCanvas(): void {
    const { clientWidth, clientHeight } = this.canvas
    if (clientWidth === this.screen.width && clientHeight === this.screen.height) return
    this.screen.width = clientWidth
    this.screen.height = clientHeight
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(clientWidth, clientHeight, false)
    this.picture.resize(clientWidth, clientHeight, this.pixelRatio)
    this.uniforms.uPixels.value = clientHeight * this.pixelRatio
  }

  render({ from, to, hold, move, layouts, time, delta, speed, open }: Shot): void {
    if (!this.canvas.clientWidth) return
    this.fitCanvas()
    this.blocks.load(from, to)

    const { uniforms, pointer, rig } = this
    const t = smoother(move)
    const flight = MOVES[to]
    const { shock, hit, flash } = impactAt(from, to, hold, move)
    const flying = move > 0

    uniforms.uT.value = move
    uniforms.uTime.value = time
    uniforms.uBlast.value = flying ? flight.blast : 0
    uniforms.uSwirl.value = flying ? flight.swirl : 0
    uniforms.uTumble.value = flight.tumble
    uniforms.uShock.value = shock
    uniforms.uTouch.value = this.touched

    const eye = rig.update({ from, to, hold, t, layouts }, this.screen, { time, delta, speed, hit, aim: pointer })
    uniforms.uEye.value.copy(eye)
    uniforms.uRay.value.set(pointer.x, pointer.y, 0.5).unproject(rig.camera).sub(eye).normalize()
    this.set.light(from, to, t)

    const sun = this.sun.copy(eye).addScaledVector(SUN, 90).project(rig.camera)
    this.picture.draw(
      {
        sunX: sun.x * 0.5 + 0.5,
        sunY: sun.y * 0.5 + 0.5,
        shafts: sun.z < 1 ? Math.max(0, uniforms.uSun.value - 0.15) * 2 : 0,
        speed: Math.min(1, Math.abs(speed)),
        time,
        open,
        flash,
      },
      delta,
    )
  }
}
