import { bot } from './bot.ts'
import { crew } from './crew.ts'
import { gate } from './gate.ts'
import type { Formation, Pose } from './parts.ts'
import { dashboard, exploded, fullstack, react, website } from './screens.ts'
import { sprue } from './sprue.ts'
import { line, loose, rebuild } from './story.ts'

/** Upper bound of parts in any formation: the size of the one instanced mesh that draws them all. */
export const MAX_PARTS = 96

export const formations = {
  bot: (pose) => bot(pose),
  cheer: (pose) => bot(pose, true),
  loose,
  sprue,
  line,
  rebuild,
  exploded,
  website,
  dashboard,
  react,
  fullstack,
  gateIdle: (pose) => gate('idle', pose),
  gateOpen: (pose) => gate('open', pose),
  gateShut: (pose) => gate('shut', pose),
  crew,
} satisfies Record<string, (pose: Pose) => Formation>

export type FormationName = keyof typeof formations

export function isFormation(name: string | undefined): name is FormationName {
  return name !== undefined && Object.hasOwn(formations, name)
}
