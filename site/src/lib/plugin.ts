import { globSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { agents as agentCopy, skillGroups } from '../content/catalogue.ts'
import { enDetails } from '../content/en-details.ts'
import type { Facts, HookEvent } from '../content/types.ts'

// Astro runs from site/, next to plugins/.
export const PLUGIN_DIR = resolve(process.cwd(), '../plugins/wajiha-kit')

const read = (...path: string[]): string => readFileSync(join(PLUGIN_DIR, ...path), 'utf8')

export function assertSameNames(kind: string, shipped: string[], described: string[]): void {
  const missing = shipped.filter((name) => !described.includes(name))
  const stale = described.filter((name) => !shipped.includes(name))
  if (missing.length === 0 && stale.length === 0) return
  throw new Error(
    `site/src/content/catalogue.ts is out of date for ${kind}. Missing: ${missing.join(', ') || 'none'}. Stale: ${stale.join(', ') || 'none'}.`,
  )
}

export const skillNames = readdirSync(join(PLUGIN_DIR, 'skills'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
export const agentNames = readdirSync(join(PLUGIN_DIR, 'agents'))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''))

assertSameNames('skills', skillNames, skillGroups.flatMap((group) => Object.keys(group.skills)))
assertSameNames('agents', agentNames, Object.keys(agentCopy))

export const manualSkills = new Set(
  skillNames.filter((name) => /^disable-model-invocation:\s*true/m.test(read('skills', name, 'SKILL.md'))),
)

export const version: string = JSON.parse(read('.claude-plugin', 'plugin.json')).version

const ruleFiles = globSync('templates/**/rules/*.md', { cwd: PLUGIN_DIR }).map((file) => file.replaceAll('\\', '/')).sort()

export const ruleGroups = Object.keys(enDetails.rules.groups).map((group) => ({
  group,
  names: ruleFiles
    .filter((file) => file.replace(/^templates\//, '').replace(/\/rules\/[^/]+$/, '') === group)
    .map((file) => basename(file)),
}))
assertSameNames('rule files', ruleFiles.map((file) => file.replace(/^templates\//, '').replace(/\/rules\/[^/]+$/, '')), Object.keys(enDetails.rules.groups))

export const hookEvents = Object.keys(JSON.parse(read('hooks', 'hooks.json')).hooks) as HookEvent[]
assertSameNames('hook events', hookEvents, Object.keys(enDetails.session.events))

export const facts: Facts = {
  skills: skillNames.length,
  agents: agentNames.length,
  events: hookEvents.length,
  rules: ruleFiles.length,
  servers: Object.keys(JSON.parse(read('.mcp.json')).mcpServers).length,
  denied: JSON.parse(read('templates', 'react', 'settings.json')).permissions.deny.length,
  examples: readdirSync(resolve(PLUGIN_DIR, '../../examples'), { withFileTypes: true }).filter((e) => e.isDirectory()).length,
}

export const REPO = 'DiyarFirasmusa/wajiha-kit'
export const REPO_URL = `https://github.com/${REPO}`
export const INSTALL_COMMANDS = [
  `/plugin marketplace add ${REPO}`,
  '/plugin install wajiha-kit@wajiha-kit',
  '/wajiha-kit:setup',
]
