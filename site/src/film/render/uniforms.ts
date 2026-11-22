import { Color, Vector3 } from 'three'

export const SUN = new Vector3(0, 0.2, -1).normalize()

export function createUniforms() {
  return {
    uT: { value: 0 },
    uTime: { value: 0 },
    uBlast: { value: 0 },
    uSwirl: { value: 0 },
    uTumble: { value: 1 },
    uShock: { value: 0 },
    uTouch: { value: 0 },
    uRay: { value: new Vector3(0, 0, -1) },
    uEye: { value: new Vector3() },
    uLight: { value: new Color() },
    uBase: { value: new Color() },
    uSun: { value: 0 },
    uSunDir: { value: SUN },
    uPixels: { value: 1000 },
  }
}

export type FilmUniforms = ReturnType<typeof createUniforms>
