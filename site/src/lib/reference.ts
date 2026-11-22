import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { HookEvent } from '../content/types.ts'
import { agentNames, PLUGIN_DIR, skillNames } from './plugin.ts'

// What the documentation shows of the plugin's own files, read at build time.
const read = (...path: string[]): string => readFileSync(join(PLUGIN_DIR, ...path), 'utf8')

function frontmatter(source: string): Record<string, string> {
  const head = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? ''
  return Object.fromEntries([...head.matchAll(/^([\w-]+):[ \t]*(.+)$/gm)].map(([, key, value]) => [key, value!.replace(/^"(.*)"$/, '$1').replaceAll('\\"', '"')]))
}

/** Bundled from other projects: described here and linked, their text is not republished. */
const borrowed = new Map(
  [...read('THIRD_PARTY_NOTICES.md').matchAll(/^\| `([\w-]+)` \| ([^|]+) \| ([^|]+) \|/gm)].map(([, name, origin, licence]) => [
    name,
    { origin: origin!.trim(), licence: licence!.split('—')[0]!.trim() },
  ]),
)

const skillSources = new Map(skillNames.map((name) => [name, read('skills', name, 'SKILL.md')]))
const agentSources = new Map(agentNames.map((name) => [name, read('agents', `${name}.md`)]))

const names = (source: string, skill: string): boolean => new RegExp(`\`(/?frontend-kit:|/)?${skill}\`|frontend-kit:${skill}\\b`).test(source)

export interface SkillReference {
  /** The text Claude matches a request against. */
  matches: string
  argument: string | undefined
  borrowed: { origin: string; licence: string } | undefined
  /** Every Markdown file of it, the playbook first. */
  files: string[]
  mentionedBy: string[]
}

export const skillReference: Record<string, SkillReference> = Object.fromEntries(
  skillNames.map((name) => {
    const head = frontmatter(skillSources.get(name)!)
    const others = globSync(`skills/${name}/**/*.md`, { cwd: PLUGIN_DIR })
      .filter((file) => !file.endsWith(`/${name}/SKILL.md`))
      .sort()
    return [
      name,
      {
        matches: head['description'] ?? '',
        argument: head['argument-hint'],
        borrowed: borrowed.get(name),
        files: [`skills/${name}/SKILL.md`, ...others],
        mentionedBy: agentNames.filter((agent) => names(agentSources.get(agent)!, name)),
      },
    ]
  }),
)

export interface AgentReference {
  matches: string
  effort: string
  tools: string[]
  skills: string[]
}

export const agentReference: Record<string, AgentReference> = Object.fromEntries(
  agentNames.map((name) => {
    const source = agentSources.get(name)!
    const head = frontmatter(source)
    return [
      name,
      {
        matches: head['description'] ?? '',
        effort: head['effort'] ?? '',
        tools: (head['tools'] ?? '').split(/,\s*/).filter(Boolean),
        skills: skillNames.filter((skill) => names(source, skill)),
      },
    ]
  }),
)

export interface HookRun {
  script: string
  matcher: string | undefined
  timeout: number
  /** The comment at the top of the script. */
  about: string
}

const hookFile: Record<string, { matcher?: string; hooks: { command: string; timeout: number }[] }[]> = JSON.parse(read('hooks', 'hooks.json')).hooks

export const hookRuns = (event: HookEvent): HookRun[] =>
  (hookFile[event] ?? []).flatMap(({ matcher, hooks }) =>
    hooks.map(({ command, timeout }) => {
      const script = /scripts\/([\w.-]+\.sh)/.exec(command)![1]!
      const lines = read('scripts', script).split('\n').slice(1)
      const end = lines.findIndex((line) => !line.startsWith('#'))
      return { script, matcher, timeout, about: lines.slice(0, end).map((line) => line.replace(/^# ?/, '')).join('\n') }
    }),
  )

export const templateJson = (profile: string, file: 'frontend-kit.json' | 'settings.json'): string => read('templates', profile, file).trim()
