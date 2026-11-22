import { IMPACT } from './direction.ts'
import type { ShapeName } from './shapes/index.ts'
import { clamp } from './timeline.ts'

const LOCK_AT = 0.72
const REFUSAL_LENGTH = 0.26

export interface Impact {
  /** The ring running through the blocks, 0 to 1. */
  shock: number
  /** The jolt of the camera. */
  hit: number
  flash: number
}

const QUIET: Impact = { shock: 0, hit: 0, flash: 0 }

/** The two blows: the screen locking together, and the gate refusing. */
export function impactAt(from: ShapeName, to: ShapeName, hold: number, move: number): Impact {
  if (from === 'broken' && to === 'screen' && move > LOCK_AT) {
    const shock = (move - LOCK_AT) / (1 - LOCK_AT)
    return { shock, hit: clamp(1 - shock * 3), flash: 0 }
  }
  if (from === 'gate' && move === 0 && hold > IMPACT && hold < IMPACT + REFUSAL_LENGTH) {
    const shock = (hold - IMPACT) / REFUSAL_LENGTH
    const hit = clamp(1 - shock * 3)
    return { shock, hit, flash: hit * 0.22 }
  }
  return QUIET
}
