import type { SceneId } from './scenes.ts'

export type Locale = 'en' | 'ar'
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

export interface SceneCopy {
  title: string | ((facts: Facts) => string)
  text?: string
  points?: string[]
  steps?: [name: string, text: string][]
}

/** The long read under the film: why to use the kit and everything it holds. */
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
  session: { title: string; lead: string; events: Record<HookEvent, [name: string, text: string, short: string]> }
  refactor: { title: string; lead: string; steps: [command: string, text: string][]; note: string }
  answers: { title: string; items: [question: string, answer: string][] }
}

export interface Copy {
  dir: 'ltr' | 'rtl'
  meta: { title: string; description: string }
  chrome: {
    skip: string
    sections: string
    menu: string
    nav: { why: string; how: string; projects: string; skills: string; agents: string; checks: string; guards: string; details: string }
    install: string
    switchLanguage: string
    pause: string
    play: string
    cue: string
  }
  scenes: Record<SceneId, SceneCopy>
  facts: { skills: string; agents: string; rules: string; events: string }
  box: { title: string; lead: string; contents: (facts: Facts) => [amount: number, label: string][] }
  projects: { title: string; lead: string; items: { name: string; text: string; stack: string[] }[] }
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
  parts: { title: string; lead: (facts: Facts) => string; manual: string }
  crew: { title: string; lead: (facts: Facts) => string }
  install: { title: string; lead: string; steps: string[]; needs: string; copy: string; copied: string; failed: string }
  footer: { source: string; changelog: string; examples: string; notices: string }
}
