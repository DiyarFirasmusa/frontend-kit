import { agents, skillGroups } from '../content/catalogue.ts'
import { emblemOf } from '../content/emblems.ts'
import type { PageId } from '../content/guide/pages.ts'
import { enDetails } from '../content/en-details.ts'
import type { HookEvent, Locale } from '../content/types.ts'
import type { ShapeName } from '../film/shapes/index.ts'
import { agentUrl, hookUrl, ruleUrl, skillUrl } from './links.ts'
import { hookEvents, ruleGroups } from './plugin.ts'
import type { Route } from './routes.ts'

/** The kit as it stands on the stage: the order of each kind's objects, and where every page points the camera. */
export const skillOrder = skillGroups.flatMap(({ skills }) => Object.keys(skills))
export const agentOrder = Object.keys(agents)
export const hookOrder = (Object.keys(enDetails.session.events) as HookEvent[]).filter((event) => hookEvents.includes(event))

/** These list a whole kind, so they show all of its objects, each one to press. */
const OVERVIEW: Partial<Record<PageId, ShapeName>> = { skills: 'skills', agents: 'agents', rules: 'rules' }

export interface StageView {
  shape: ShapeName
  stop: number
}

export function viewOfRoute(route: Route): StageView {
  const whole = (shape: ShapeName): StageView => ({ shape, stop: -1 })
  switch (route.kind) {
    case 'home':
      return whole('mark')
    case 'page':
      return whole(OVERVIEW[route.id] ?? emblemOf.page(route.id))
    case 'skill':
      return whole(emblemOf.skill(route.name))
    case 'agent':
      return whole(emblemOf.agent(route.name))
    case 'rule':
      return whole(emblemOf.rule(route.name))
    case 'hook':
      return whole(emblemOf.hook(route.event))
  }
}

interface StageObject extends StageView {
  name: string
  href: string
}

/** Every object that can be pressed on the stage. */
export function objectsOf(locale: Locale, groupNames: Record<string, string>): StageObject[] {
  return [
    ...skillOrder.map((name, stop) => ({ shape: 'skills' as const, stop, name, href: skillUrl(locale, name) })),
    ...agentOrder.map((name, stop) => ({ shape: 'agents' as const, stop, name, href: agentUrl(locale, name) })),
    ...ruleGroups.map(({ group, names }, stop) => ({
      shape: 'rules' as const,
      stop,
      name: `${groupNames[group] ?? group}: ${names.length}`,
      href: ruleUrl(locale, group, names[0]!),
    })),
    ...hookOrder.map((event, stop) => ({ shape: 'checks' as const, stop, name: event, href: hookUrl(locale, event) })),
  ]
}
