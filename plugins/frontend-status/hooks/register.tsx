import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Gate, RepoStatus } from '../types'

const REFRESH_MS = 15_000
// The same fingerprint frontend-kit's hooks write into last-gate.json (lib.sh hook_src_fingerprint), so a gate
// on older src/ shows as stale. Inlined: this plugin cannot know where frontend-kit is installed.
const FINGERPRINT_SCRIPT =
  'cd "$1" && { git diff HEAD -- src 2>/dev/null; git ls-files --others --exclude-standard -z -- src 2>/dev/null | ' +
  'while IFS= read -r -d "" file; do printf "%s\\n" "$file"; cat "$file" 2>/dev/null; done; } | shasum | cut -c1-16'

/** The project settings frontend-kit's setup writes; the band shows only in projects that have it. */
type KitConfig = { devPort: number; defaultBranch: string; protectedBranches: readonly string[] }

function parseConfig(text: string): KitConfig | null {
  try {
    const value: unknown = JSON.parse(text)
    if (typeof value !== 'object' || value === null) return null
    const { devPort, defaultBranch, protectedBranches } = value as Record<string, unknown>
    const branches = Array.isArray(protectedBranches) ? protectedBranches.filter(b => typeof b === 'string') : []
    return {
      devPort: Number(devPort) || 5173,
      defaultBranch: typeof defaultBranch === 'string' && defaultBranch !== '' ? defaultBranch : 'main',
      protectedBranches: branches.length ? branches : ['main', 'master'],
    }
  } catch {
    return null
  }
}

// Bump the shape when RepoStatus changes: a reload then ignores what the old code stored.
const status = atom({ plugin: 'frontend-status', key: 'status' } as const, null, { shape: 'status-3' })

async function run($: EngineInterface, argv: readonly string[]): Promise<{ ok: boolean; out: string }> {
  try {
    const result = await $.process.run(argv, { timeoutMs: 5_000 })
    return { ok: result.exitCode === 0, out: result.stdout.trim() }
  } catch {
    return { ok: false, out: '' }
  }
}

function parseGate(text: string): Gate | null {
  try {
    const value: unknown = JSON.parse(text)
    if (typeof value !== 'object' || value === null) return null
    const { result, source, at, summary, fingerprint } = value as Record<string, unknown>
    if ((result !== 'pass' && result !== 'fail') || typeof at !== 'string') return null
    return {
      result,
      at,
      source: typeof source === 'string' ? source : '',
      summary: typeof summary === 'string' ? summary : '',
      fingerprint: typeof fingerprint === 'string' && fingerprint !== '' ? fingerprint : null,
    }
  } catch {
    return null
  }
}

/** Reads the repo's state; null outside a frontend-kit project, so the band stays away elsewhere. */
async function readStatus($: EngineInterface): Promise<RepoStatus | null> {
  const root = await run($, ['git', 'rev-parse', '--show-toplevel'])
  if (!root.ok) return null
  let config: KitConfig | null = null
  try {
    config = parseConfig(await $.fs.read(`${root.out}/.claude/frontend-kit.json`))
  } catch {
    config = null
  }
  if (config === null) return null

  const base = `origin/${config.defaultBranch}`
  const [branch, porcelain, counts, port] = await Promise.all([
    run($, ['git', 'branch', '--show-current']),
    run($, ['git', 'status', '--porcelain']),
    run($, ['git', 'rev-list', '--left-right', '--count', `${base}...HEAD`]),
    run($, ['lsof', '-nP', `-iTCP:${config.devPort}`, '-sTCP:LISTEN', '-t']),
  ])

  const [behind, ahead] = counts.ok ? counts.out.split(/\s+/).map(Number) : []
  let gate: Gate | null = null
  try {
    gate = parseGate(await $.fs.read(`${root.out}/.claude/state/last-gate.json`))
  } catch {
    gate = null
  }
  const fingerprint =
    gate?.fingerprint && root.ok ? await run($, ['bash', '-c', FINGERPRINT_SCRIPT, 'frontend-status', root.out]) : null

  return {
    branch: branch.out || 'detached',
    changed: porcelain.out === '' ? 0 : porcelain.out.split('\n').length,
    ahead: ahead ?? null,
    behind: behind ?? null,
    gate,
    srcFingerprint: fingerprint?.ok && fingerprint.out !== '' ? fingerprint.out : null,
    isDevServerUp: port.ok && port.out !== '',
    devPort: config.devPort,
    defaultBranch: config.defaultBranch,
    isProtected: config.protectedBranches.includes(branch.out),
  }
}

async function refresh($: EngineInterface): Promise<void> {
  const next = await readStatus($)
  await update($, status, () => next)
}

function ago(isoTime: string, nowMs: number): string {
  const minutes = Math.round((nowMs - Date.parse(isoTime)) / 60_000)
  if (!Number.isFinite(minutes)) return ''
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return hours < 48 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`
}

/** True when src/ changed after the last gate ran, so its ✓/✗ no longer describes the code. */
function isGateStale(current: RepoStatus): boolean {
  const recorded = current.gate?.fingerprint ?? null
  return recorded !== null && current.srcFingerprint !== null && recorded !== current.srcFingerprint
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'frontend-status',
      description: 'Refresh the status band (branch, changes, gate, dev server)',
    })
    await refresh($)
    $.clock.every(REFRESH_MS, () => void refresh($))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('command.run', { command: 'frontend-status' }, async $ => {
    await refresh($)
    const current = await read($, status)

    return { text: current === null ? 'Not in a frontend-kit project (no .claude/frontend-kit.json).' : `Branch ${current.branch}, ${current.changed} changed file(s).` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, status)
    if (e.props.hasSurvey || current === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const isProtected = current.isProtected
    const nowMs = await $.clock.now()
    const sync =
      current.ahead === null || current.behind === null
        ? `origin/${current.defaultBranch} ?`
        : `↑${current.ahead} ↓${current.behind} ${current.defaultBranch}`

    return (
      <Box flexDirection="row" gap={2}>
        <Text color={isProtected ? 'error' : 'success'} bold={isProtected}>
          ⎇ {current.branch}
          {isProtected ? ' (protected)' : ''}
        </Text>
        <Text dimColor={current.changed === 0}>{current.changed} changed</Text>
        <Text dimColor>{sync}</Text>
        {current.gate === null ? (
          <Text dimColor>gate –</Text>
        ) : isGateStale(current) ? (
          <Text dimColor>gate ? stale</Text>
        ) : (
          <Text color={current.gate.result === 'pass' ? 'success' : 'error'}>
            gate {current.gate.result === 'pass' ? '✓' : '✗'} {ago(current.gate.at, nowMs)}
          </Text>
        )}
        <Text color={current.isDevServerUp ? 'success' : 'inactive'}>
          :{current.devPort} {current.isDevServerUp ? 'up' : 'off'}
        </Text>
      </Box>
    )
  })
}
