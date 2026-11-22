import type { Vec3 } from './shapes/blocks.ts'
import type { ShapeName } from './shapes/index.ts'

interface Shot {
  from: Vec3
  to: Vec3
  look: Vec3
  lookTo: Vec3
  fov: number
  /** How much wider it opens on a phone, so the subject still fits. */
  phone: number
}

const shot = (from: Vec3, to: Vec3, look: Vec3, options: Partial<Pick<Shot, 'lookTo' | 'fov' | 'phone'>> = {}): Shot => ({
  from,
  to,
  look,
  lookTo: look,
  fov: 38,
  phone: 2.15,
  ...options,
})

const CENTRED: Vec3 = [0, 10, 0]

export const SHOTS: Record<ShapeName, Shot> = {
  storm: shot([0, 11, 22], [0, 11, 22], CENTRED),
  mark: shot([-13, 7, 35], [-4, 12, 35], CENTRED),
  broken: shot([11, 14, 42], [3, 8, 38], CENTRED),
  screen: shot([-12, 12, 39], [-2, 10, 37], CENTRED),
  layers: shot([24, 16, 38], [30, 14, 30], CENTRED),
  website: shot([-14, 13, 36], [-5, 10, 37], CENTRED),
  dashboard: shot([14, 11, 36], [5, 10, 37], CENTRED),
  both: shot([0, 17, 46], [0, 12, 43], CENTRED),
  skills: shot([7, 8.5, 2], [-7, 8.5, 2], [-16, 8, -18], { lookTo: [16, 8, -18], fov: 56, phone: 1 }),
  agents: shot([8, 3, 15], [-3, 4, 14], [0, 8, -14], { fov: 54, phone: 1.7 }),
  rules: shot([-6, 4, 14], [4, 5, 13], [0, 6, -18], { fov: 50, phone: 1.9 }),
  checks: shot([1, 10.5, 37], [0, 10, -56], [0, 10, -10], { lookTo: [0, 10, -100], fov: 60, phone: 1.25 }),
  gate: shot([-15, 9, 30], [0, 10, 29], CENTRED, { fov: 44, phone: 1.75 }),
}

export interface Grade {
  base: string
  metal: string
  light: string
  sun: number
  key: number
  rim: number
}

/** One palette: graphite, titanium and warm ivory light. Red only means "wrong". */
const grade = (metal: string, over: Partial<Grade> = {}): Grade => ({
  base: '#050607',
  metal,
  light: '#efe3d0',
  sun: 0.1,
  key: 1.7,
  rim: 3.2,
  ...over,
})

export const GRADES: Record<ShapeName, Grade> = {
  storm: grade('#6d7075', { sun: 0.02, key: 0.5 }),
  mark: grade('#999691', { base: '#090807', sun: 0.34, key: 2.1, rim: 2.2 }),
  broken: grade('#605d5c', { base: '#080505', light: '#93362e', key: 1, rim: 2.2 }),
  screen: grade('#a4a6a8', { sun: 0.2, key: 2.2 }),
  layers: grade('#96999d', { key: 2.1 }),
  website: grade('#a4a6a8', { key: 2.2 }),
  dashboard: grade('#a4a6a8', { key: 2.2 }),
  both: grade('#a4a6a8', { key: 2.2, sun: 0.22 }),
  skills: grade('#74777c', { key: 1.2 }),
  agents: grade('#55595e', { sun: 0.45, key: 0.7 }),
  rules: grade('#6b6f74', { sun: 0.2, key: 1.2 }),
  checks: grade('#696866', { sun: 0.34, key: 0.8 }),
  gate: grade('#7d8085', { key: 1.9, sun: 0.07 }),
}

interface Move {
  swirl: number
  blast: number
  /** 0 keeps the pieces upright on the way, for screens that mend. */
  tumble: number
}

const move = (over: Partial<Move> = {}): Move => ({ swirl: 0, blast: 0, tumble: 1, ...over })
const UPRIGHT = move({ tumble: 0 })

/** How blocks fly, by the shape they fly to. */
export const MOVES: Record<ShapeName, Move> = {
  storm: move(),
  mark: move({ swirl: 0.8 }),
  broken: move({ blast: 0.8 }),
  screen: UPRIGHT,
  layers: UPRIGHT,
  website: UPRIGHT,
  dashboard: UPRIGHT,
  both: UPRIGHT,
  skills: move({ blast: 0.55, swirl: 0.35 }),
  agents: move({ swirl: 0.6 }),
  rules: move({ swirl: 0.3 }),
  checks: move({ blast: 0.4 }),
  gate: move({ swirl: 0.5 }),
}

/** The moment inside the gate scene when the command is thrown back. */
export const IMPACT = 0.56
