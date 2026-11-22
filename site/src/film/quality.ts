import { FULL, LITE, type Budget } from './shapes/index.ts'

export interface Quality {
  budget: Budget
  pixelRatio: number
  samples: number
  motes: number
  reflection: boolean
}

const FULL_QUALITY: Quality = { budget: FULL, pixelRatio: 1.5, samples: 4, motes: 900, reflection: true }
const LITE_QUALITY: Quality = { budget: LITE, pixelRatio: 1.35, samples: 2, motes: 350, reflection: false }

export function pickQuality(): Quality {
  const phone = Math.min(innerWidth, innerHeight) < 600
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return phone || memory <= 4 || navigator.hardwareConcurrency <= 4 ? LITE_QUALITY : FULL_QUALITY
}

/** Drawing without a GPU: the still page is far better than this film at four frames a second. */
export function isSoftwareRenderer(gl: WebGL2RenderingContext | WebGLRenderingContext): boolean {
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)
}

const SMOOTH_FRAME = 1 / 45
const USABLE_FRAME = 1 / 22
const PATIENCE_SECONDS = 2.5
const LAST_PATIENCE_SECONDS = 5

/**
 * Watches frame times while the visitor is really looking. Each time they stay slow it asks for a cheaper
 * step, and when the cheapest is still unusable it gives the film up.
 */
export class Governor {
  private slowFor = 0
  private average = SMOOTH_FRAME
  private readonly cheaper: () => boolean
  private readonly giveUp: () => void

  constructor(cheaper: () => boolean, giveUp: () => void) {
    this.cheaper = cheaper
    this.giveUp = giveUp
  }

  frame(delta: number): void {
    // A background window is throttled by the browser, which says nothing about the device.
    if (document.hidden || !document.hasFocus()) {
      this.slowFor = 0
      this.average = SMOOTH_FRAME
      return
    }
    this.average += (Math.min(delta, 0.25) - this.average) * 0.06
    this.slowFor = this.average > SMOOTH_FRAME ? this.slowFor + delta : 0
    if (this.slowFor < PATIENCE_SECONDS) return
    if (this.cheaper()) {
      this.slowFor = 0
    } else if (this.average > USABLE_FRAME && this.slowFor > LAST_PATIENCE_SECONDS) {
      this.giveUp()
    }
  }
}
