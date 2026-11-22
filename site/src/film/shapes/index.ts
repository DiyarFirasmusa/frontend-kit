import type { Shape, Vec3 } from './blocks.ts'
import { emblem, isEmblem, type EmblemName } from './emblems/build.ts'
import { mark, passage, storm, vault } from './monuments.ts'
import { pack } from './pack.ts'
import { both, broken, dashboard, layers, website } from './screens.ts'
import { council, ruleTablets, skillWall } from './walls.ts'

/** What the shapes are counted from: the plugin itself, read at build time. */
export interface Census {
  skills: number
  agents: number
  events: number
  ruleGroups: number[]
}

export interface Budget {
  blocks: number
  /** Above 1, shapes are built from fewer, larger tiles. */
  tileScale: number
}

/** The shapes built before the first frame. */
export type FixedShape =
  | 'storm'
  | 'mark'
  | 'broken'
  | 'screen'
  | 'layers'
  | 'website'
  | 'dashboard'
  | 'both'
  | 'skills'
  | 'agents'
  | 'rules'
  | 'checks'
  | 'gate'

/** Any shape: an emblem is built when it is first asked for. */
export type ShapeName = FixedShape | EmblemName
/** What light, camera and flight are directed by. */
export type SetName = FixedShape | 'emblem'

export const setOf = (name: ShapeName): SetName => (isEmblem(name) ? 'emblem' : (name as FixedShape))

type Build = (census: Census, budget: Budget) => Shape

export const SHAPES: Record<FixedShape, Build> = {
  storm: (_, { blocks }) => storm(blocks),
  mark: (_, { tileScale }) => mark(tileScale),
  broken: (_, { tileScale }) => broken(tileScale),
  screen: (_, { tileScale }) => dashboard(tileScale),
  layers: (_, { tileScale }) => layers(tileScale),
  website: (_, { tileScale }) => website(tileScale),
  dashboard: (_, { tileScale }) => dashboard(tileScale),
  both: (_, { tileScale }) => both(tileScale),
  skills: ({ skills }, { tileScale }) => skillWall(skills, tileScale),
  agents: ({ agents }) => council(agents),
  rules: ({ ruleGroups }, { tileScale }) => ruleTablets(ruleGroups, tileScale),
  checks: ({ events }, { tileScale }) => passage(events, tileScale),
  gate: (_, { tileScale }) => vault(tileScale),
}

export function isShape(name: string | undefined): name is ShapeName {
  return name !== undefined && (Object.hasOwn(SHAPES, name) || isEmblem(name))
}

export const FULL: Budget = { blocks: 9000, tileScale: 1 }
export const LITE: Budget = { blocks: 4600, tileScale: 1.45 }

export interface BuiltShapes {
  blocksOf(name: ShapeName): Float32Array
  anchors: Partial<Record<ShapeName, Vec3[]>>
}

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

/** Builds every shape, giving the main thread back between them. */
export async function buildShapes(census: Census, budget: Budget): Promise<BuiltShapes> {
  const data = new Map<ShapeName, Float32Array>()
  const anchors: Partial<Record<ShapeName, Vec3[]>> = {}
  for (const name of Object.keys(SHAPES) as FixedShape[]) {
    const shape = SHAPES[name](census, budget)
    data.set(name, pack(shape, budget.blocks))
    if (shape.anchors) anchors[name] = shape.anchors
    await nextTask()
  }
  const blocksOf = (name: ShapeName): Float32Array => {
    let built = data.get(name)
    if (!built) {
      built = pack(emblem(name as EmblemName, budget.tileScale), budget.blocks)
      data.set(name, built)
    }
    return built
  }
  return { blocksOf, anchors }
}
