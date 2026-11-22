import type { EmblemName } from '../film/shapes/emblems/build.ts'
import type { SignName } from '../film/shapes/emblems/signs.ts'
import type { PageId } from './guide/pages.ts'
import type { HookEvent } from './types.ts'

/** The sign of every piece of the kit: what it is for, in one shape. */
export const skillSigns: Record<string, SignName> = {
  'create-component': 'component',
  'create-form': 'form',
  'create-hook': 'hookLoop',
  'create-store': 'store',
  'figma-match': 'figma',
  'frontend-design': 'brush',
  'ui-ux-pro-max': 'bulb',
  'i18n-conventions': 'translate',
  'tanstack-query-key-conventions': 'key',
  'typescript-advanced-types': 'typescript',
  'dash-create-route': 'signpost',
  'dash-create-table': 'table',
  'dash-create-filter-bar': 'funnel',
  'dash-create-detail': 'record',
  'dash-create-crud': 'crud',
  'dash-create-settings-form': 'sliders',
  'web-create-route': 'browser',
  'web-create-feature': 'blocks',
  'web-seo-page': 'seo',
  'web-server-fn': 'server',
  task: 'ticket',
  explain: 'question',
  dev: 'terminal',
  refactor: 'broom',
  'refactor-mode': 'rescue',
  'fix-everywhere': 'everywhere',
  performance: 'gauge',
  'vercel-react-best-practices': 'atom',
  'web-design-guidelines': 'compass',
  'playwright-best-practices': 'play',
  verify: 'verified',
  review: 'eyes',
  'live-check': 'cursor',
  'commit-push': 'push',
  'pr-link': 'link',
  'sync-main': 'sync',
  'branch-status': 'branches',
  'backend-request': 'envelope',
  setup: 'box',
  mode: 'switcher',
  'upgrade-mode': 'upgrade',
}

export const agentSigns: Record<string, SignName> = {
  planner: 'blueprint',
  'frontend-dev': 'code',
  'ui-designer': 'brush',
  'test-engineer': 'flask',
  'bug-hunter': 'bug',
  'frontend-reviewer': 'magnifier',
  'accessibility-auditor': 'accessible',
  'performance-optimizer': 'gauge',
  'refactor-architect': 'compass',
  'qa-engineer': 'verified',
  'frontend-security-reviewer': 'lock',
  'i18n-rtl-reviewer': 'translate',
  'upgrade-analyst': 'upgrade',
  'seo-auditor': 'seo',
}

/** By file name: a rule of two project types is about the same thing in both. */
export const ruleSigns: Record<string, SignName> = {
  'git.md': 'branches',
  'i18n.md': 'translate',
  'naming.md': 'tag',
  'project.md': 'pin',
  'quality-bar.md': 'verified',
  'react.md': 'atom',
  'rtl.md': 'sync',
  'scope.md': 'scope',
  'styles.md': 'brush',
  'testing.md': 'flask',
  'api-layer.md': 'server',
  'data-loading.md': 'store',
  'performance.md': 'gauge',
  'routing-ssr.md': 'browser',
  'seo-share.md': 'seo',
  'data-tables.md': 'table',
  'error-monitoring.md': 'signal',
  'forms-crud.md': 'crud',
  'permissions.md': 'lock',
  'routing.md': 'signpost',
  'structure.md': 'tree',
  'framework.md': 'gear',
  'auth.md': 'key',
  'data-and-state.md': 'store',
  'forms.md': 'form',
  'accessibility.md': 'accessible',
  'dependencies.md': 'packages',
  'formatting.md': 'numerals',
  'security.md': 'guard',
  'typescript.md': 'typescript',
  'nextjs.md': 'nextLetter',
  'react-router.md': 'route',
}

export const hookSigns: Record<HookEvent, SignName> = {
  SessionStart: 'sunrise',
  UserPromptSubmit: 'chat',
  PreToolUse: 'guard',
  PostToolUse: 'pencil',
  PostToolUseFailure: 'warning',
  SubagentStart: 'handover',
  SubagentStop: 'handback',
  Notification: 'bell',
  Stop: 'gate',
  SessionEnd: 'flag',
}

const pageSigns: Record<PageId, SignName> = {
  docs: 'kit',
  guide: 'kit',
  'get-started': 'box',
  examples: 'terminal',
  skills: 'component',
  agents: 'eyes',
  rules: 'ruler',
  checks: 'guard',
  features: 'blocks',
  'project-types': 'fullstack',
  modes: 'switcher',
  configuration: 'gear',
  refactor: 'rescue',
  questions: 'question',
  changelog: 'clock',
}

const named = (signs: Record<string, SignName>, name: string): SignName => {
  const sign = signs[name]
  if (!sign) throw new Error(`site/src/content/emblems.ts has no shape for ${name}`)
  return sign
}

export const emblemOf = {
  skill: (name: string): EmblemName => `emblem:plain/${named(skillSigns, name)}`,
  agent: (name: string): EmblemName => `emblem:agent/${named(agentSigns, name)}`,
  rule: (file: string): EmblemName => `emblem:rule/${named(ruleSigns, file)}`,
  hook: (event: HookEvent): EmblemName => `emblem:hook/${named(hookSigns, event)}`,
  page: (id: PageId): EmblemName => `emblem:plain/${pageSigns[id]}`,
}
