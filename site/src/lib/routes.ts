import { PAGES, type PageId } from '../content/guide/pages.ts'
import type { Locale } from '../content/types.ts'
import { agentNames, skillNames } from './plugin.ts'

export const LOCALES = ['en', 'ar'] as const satisfies readonly Locale[]

export type Route =
  | { kind: 'home' }
  | { kind: 'page'; id: PageId }
  | { kind: 'skill'; name: string }
  | { kind: 'agent'; name: string }

/** A route's path under its language, with a trailing slash. */
export function routePath(route: Route): string {
  switch (route.kind) {
    case 'home':
      return ''
    case 'page':
      return `${route.id}/`
    case 'skill':
      return `skills/${route.name}/`
    case 'agent':
      return `agents/${route.name}/`
  }
}

export const allRoutes = (): Route[] => [
  { kind: 'home' },
  ...(Object.keys(PAGES) as PageId[]).map((id) => ({ kind: 'page', id }) as const),
  ...skillNames.map((name) => ({ kind: 'skill', name }) as const),
  ...agentNames.map((name) => ({ kind: 'agent', name }) as const),
]
