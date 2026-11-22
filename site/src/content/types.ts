export type Locale = 'en' | 'ar'
export type ProfileId = 'website' | 'dashboard' | 'react' | 'fullstack'
export type VerdictId = 'force' | 'verify' | 'main' | 'reset' | 'secrets' | 'live' | 'typecheck'

export interface Facts {
  skills: number
  agents: number
  events: number
  rules: number
  servers: number
  denied: number
  examples: number
}

export type HookEvent =
  | 'SessionStart'
  | 'UserPromptSubmit'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PostToolUseFailure'
  | 'SubagentStop'
  | 'Notification'
  | 'Stop'
  | 'SessionEnd'

/** The long read: why to use the kit and everything it holds. */
export interface Details {
  why: {
    title: string
    lead: string
    without: string
    with: string
    pairs: [without: string, withKit: string][]
    fit: { title: string; items: string[] }
    skip: { title: string; items: string[] }
  }
  features: { title: string; lead: string; groups: { title: string; items: [name: string, text: string][] }[] }
  rules: { title: string; lead: (facts: Facts) => string; groups: Record<string, string> }
  session: { title: string; lead: string; events: Record<HookEvent, [name: string, text: string]> }
  refactor: { title: string; lead: string; steps: [command: string, text: string][]; note: string }
  answers: { title: string; items: [question: string, answer: string][] }
}

export interface Copy {
  dir: 'ltr' | 'rtl'
  meta: { title: string; description: string }
  chrome: {
    skip: string
    home: string
    nav: { why: string; features: string; profiles: string; gate: string; parts: string; answers: string }
    install: string
    switchLanguage: string
    pause: string
    play: string
  }
  hero: { line: string; lead: string; install: string; jump: string }
  runner: { title: string; lead: (facts: Facts) => string; box: string; contents: (facts: Facts) => [string, string][] }
  build: { title: string; steps: { title: string; text: string }[] }
  profiles: { title: string; list: string; items: Record<ProfileId, { name: string; title: string; text: string; stack: string[] }> }
  gate: {
    title: string
    lead: string
    commands: string
    waiting: string
    denied: string
    allowed: string
    quiet: string
    notes: Record<VerdictId, string>
    after: string
  }
  parts: { title: string; lead: (facts: Facts) => string; empty: string; emptyText: string; auto: string; manual: string }
  crew: { title: string; lead: (facts: Facts) => string }
  install: { title: string; lead: string; steps: string[]; needs: string; copy: string; copied: string; failed: string; source: string }
  footer: { source: string; changelog: string; examples: string; notices: string }
}
