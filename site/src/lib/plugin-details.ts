import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { agentGuides } from '../content/guide/agents.ts'
import { exampleProjects } from '../content/guide/examples.ts'
import { projects, type ProfileId } from '../content/guide/projects.ts'
import { ruleGuides } from '../content/guide/rules.ts'
import { skillGuides } from '../content/guide/skills/index.ts'
import { agentNames, assertSameNames, PLUGIN_DIR, ruleGroups, skillNames } from './plugin.ts'

const read = (...path: string[]): string => readFileSync(join(PLUGIN_DIR, ...path), 'utf8')

export interface RuleFile {
  key: string
  name: string
  /** Empty: it loads in every session. */
  paths: string[]
}

export const ruleFiles: Record<string, RuleFile[]> = Object.fromEntries(
  ruleGroups.map(({ group, names }) => [
    group,
    names.map((name) => {
      const front = /^---\n([\s\S]*?)\n---/.exec(read('templates', group, 'rules', name))?.[1] ?? ''
      const paths = [...front.matchAll(/^\s+-\s+"([^"]+)"/gm)].map((match) => match[1]!)
      return { key: `${group}/${name}`, name, paths }
    }),
  ]),
)

const switchedOff = new Map(
  projects.map(({ id }) => {
    const deny: string[] = JSON.parse(read('templates', id, 'settings.json')).permissions.deny
    return [id, new Set(deny.map((rule) => /^Skill\(frontend-kit:(.+)\)$/.exec(rule)?.[1]).filter((name) => name !== undefined))] as const
  }),
)

/** The project types a skill is switched on for, from the settings setup installs. */
export function profilesOf(skill: string): ProfileId[] {
  return projects.map(({ id }) => id).filter((id) => !switchedOff.get(id)?.has(skill))
}

export interface AgentFacts {
  model: string
  edits: boolean
}

export const agentFacts: Record<string, AgentFacts> = Object.fromEntries(
  agentNames.map((name) => {
    const source = read('agents', `${name}.md`)
    const tools = /^tools:\s*(.+)$/m.exec(source)?.[1] ?? ''
    return [name, { model: /^model:\s*(\S+)/m.exec(source)?.[1] ?? '', edits: /\b(Edit|Write)\b/.test(tools) }]
  }),
)

export const hookScripts: Record<string, string[]> = Object.fromEntries(
  Object.entries<{ hooks: { command?: string }[] }[]>(JSON.parse(read('hooks', 'hooks.json')).hooks).map(([event, entries]) => [
    event,
    entries
      .flatMap((entry) => entry.hooks)
      .map((hook) => /scripts\/([\w.-]+\.sh)/.exec(hook.command ?? '')?.[1])
      .filter((script) => script !== undefined),
  ]),
)

const exampleFolders = readdirSync(resolve(PLUGIN_DIR, '../../examples'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

assertSameNames('skill guides', skillNames, Object.keys(skillGuides))
assertSameNames('agent guides', agentNames, Object.keys(agentGuides))
assertSameNames('rule guides', Object.values(ruleFiles).flat().map((rule) => rule.key), Object.keys(ruleGuides))
assertSameNames('example projects', exampleFolders, Object.keys(exampleProjects))

for (const [skill, guide] of Object.entries(skillGuides)) {
  const unknown = guide.related.filter((name) => !skillNames.includes(name))
  if (unknown.length > 0) throw new Error(`The guide of ${skill} links to unknown skills: ${unknown.join(', ')}`)
}
