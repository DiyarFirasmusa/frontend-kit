import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { VerdictId } from '../content/types.ts'
import { PLUGIN_DIR } from './plugin.ts'

const COMMANDS: Record<VerdictId, string> = {
  force: 'git push --force origin feat/table',
  verify: 'git commit -m done --no-verify',
  main: 'git push origin main',
  reset: 'git reset --hard HEAD~1',
  secrets: 'cat .env',
  live: 'curl https://api.example.com/users',
  typecheck: 'npm run typecheck',
}

export interface Verdict {
  id: VerdictId
  command: string
  denied: boolean
  reason: string
}

/** Runs the shipped guard over each command at build time, so the demo cannot drift from the plugin. */
function runGuard(): Verdict[] {
  // A small demo project in the ignored cache, reused by every build.
  const project = resolve(process.cwd(), 'node_modules/.cache/kit-guard-demo')
  mkdirSync(join(project, '.claude'), { recursive: true })
  execFileSync('git', ['init', '-q', '-b', 'main', project], { stdio: 'ignore' })
  const config = { projectName: 'demo', defaultBranch: 'main', protectedBranches: ['main'], liveHosts: ['api.example.com'] }
  writeFileSync(join(project, '.claude', 'wajiha-kit.json'), JSON.stringify(config))

  return (Object.entries(COMMANDS) as [VerdictId, string][]).map(([id, command]) => {
    // The guard reads the command as data and never executes it.
    const answer = execFileSync('bash', [join(PLUGIN_DIR, 'scripts', 'guard-bash.sh')], {
      input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: project }),
      env: { ...process.env, CLAUDE_PROJECT_DIR: project, CLAUDE_PLUGIN_ROOT: PLUGIN_DIR },
      encoding: 'utf8',
    }).trim()
    const decision = answer ? JSON.parse(answer).hookSpecificOutput : undefined
    const denied = decision?.permissionDecision === 'deny'
    if (denied !== (id !== 'typecheck')) throw new Error(`The guard gave an unexpected verdict for "${command}".`)
    return { id, command, denied, reason: decision?.permissionDecisionReason ?? '' }
  })
}

export const verdicts = runGuard()
