import type { PageId } from '../content/guide/pages.ts'
import type { Locale } from '../content/types.ts'
import { pageUrl, routeUrl } from './links.ts'

/** Where each topic is explained on the home page. */
export const CHAPTER_OF: Partial<Record<PageId, string>> = {
  guide: 'what',
  'get-started': 'how',
  'project-types': 'website',
  skills: 'skills',
  agents: 'agents',
  rules: 'rules',
  checks: 'checks',
  features: 'features',
  configuration: 'features',
  refactor: 'rescue',
  examples: 'examples',
  questions: 'questions',
}

/** A topic's chapter in the tour, or its page when only the documentation has it. */
export function topicUrl(locale: Locale, id: PageId, home: boolean): string {
  const chapter = CHAPTER_OF[id]
  if (!chapter) return pageUrl(locale, id)
  return home ? `#${chapter}` : onHome(locale, chapter)
}

export const onHome = (locale: Locale, anchor: string): string => `${routeUrl(locale, { kind: 'home' })}#${anchor}`
