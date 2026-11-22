import { HalfFloatType, Vector2, WebGLRenderTarget, type PerspectiveCamera, type Scene, type WebGLRenderer } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import type { Quality } from '../quality.ts'
import { lens } from './lens-shader.ts'

export interface LensState {
  sunX: number
  sunY: number
  shafts: number
  speed: number
  time: number
  open: number
  flash: number
}

/** Bloom, light shafts, grain and colour output. */
export class Picture {
  private readonly composer: EffectComposer
  private readonly bloom = new UnrealBloomPass(new Vector2(1, 1), 0.3, 0.35, 1.5)
  private readonly lens = new ShaderPass(lens)
  private shaftsAllowed = true

  constructor(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, quality: Quality) {
    this.composer = new EffectComposer(renderer, new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: quality.samples }))
    this.composer.addPass(new RenderPass(scene, camera))
    this.composer.addPass(this.bloom)
    this.composer.addPass(this.lens)
    this.composer.addPass(new OutputPass())
  }

  resize(width: number, height: number, pixelRatio: number): void {
    this.composer.setPixelRatio(pixelRatio)
    this.composer.setSize(width, height)
  }

  dropEffects(): void {
    this.bloom.enabled = false
    this.shaftsAllowed = false
  }

  draw(state: LensState, delta: number): void {
    const { uniforms } = this.lens
    const sunAt = uniforms['uSunAt']!.value as Vector2
    sunAt.set(state.sunX, state.sunY)
    uniforms['uShafts']!.value = this.shaftsAllowed ? state.shafts : 0
    uniforms['uSpeed']!.value = state.speed
    // Grain only needs a seed; a growing one loses its precision.
    uniforms['uTime']!.value = state.time % 60
    uniforms['uOpen']!.value = state.open
    uniforms['uFlash']!.value = state.flash
    this.composer.render(delta)
  }
}
