import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

const BAND = {
  plugin: 'frontend-status',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 4, bodyColumns: 120, scroll: { offset: 0, bodyRows: 4 }, view: {} },
} as const

const NOW = Date.parse('2026-11-06T12:00:00Z')

type Git = { branch: string; porcelain: string; counts: string; port: string; fingerprint?: string }

const CONFIG = JSON.stringify({ devPort: 3000, defaultBranch: 'develop', protectedBranches: ['develop', 'release'] })

function answers(git: Git): (argv: readonly string[]) => string | null {
  return argv => {
    const command = argv.join(' ')
    if (command === 'git rev-parse --show-toplevel') return '/repo'
    if (command === 'git branch --show-current') return git.branch
    if (command === 'git status --porcelain') return git.porcelain
    if (command.startsWith('git rev-list')) return git.counts
    if (argv[0] === 'lsof') return git.port
    if (argv[0] === 'bash' && argv[2]?.includes('shasum') && argv[4] === '/repo') return git.fingerprint ?? null
    return null
  }
}

async function startWith(
  $: Parameters<TestBody>[0],
  on: Parameters<TestBody>[1],
  git: Git,
  gate: string | null,
  config: string | null = CONFIG,
) {
  const answer = answers(git)
  on('process.run', (_, e) => {
    const stdout = answer(e.argv)
    return { value: { exitCode: stdout === null || stdout === '' ? 1 : 0, stdout: stdout ?? '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('fs.read', (_, e) => {
    const content = e.path.endsWith('frontend-kit.json') ? config : gate
    return content === null ? { deny: 'missing' } : { value: content }
  })
  on('clock.now', () => ({ value: NOW }))
  // The periodic refresh never fires within a test.
  on('clock.every', () => ({ value: undefined }))
  // Stands for the engine's own band, drawn when the mod passes.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  on('command.register', () => ({ value: { command: 'frontend-status' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
}

test('a task branch shows green with the gate, changes and the dev server', async ($, on) => {
  await startWith(
    $,
    on,
    { branch: 'fix/449-pill', porcelain: ' M a.ts\n?? b.ts', counts: '0\t3', port: '4242' },
    JSON.stringify({ result: 'pass', source: 'verify', at: '2026-11-06T11:55:00Z', summary: 'all' }),
  )
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect((await ui.find({ type: 'Text', text: /fix\/449-pill/ }))?.text).toContain('⎇ fix/449-pill')
  expect(await ui.find({ type: 'Text', text: /2 changed/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /↑3 ↓0 develop/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /gate ✓ 5m ago/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /:3000 up/ })).toBeDefined()
  await ui.unmount()
})

test('a protected branch from the project config is flagged', async ($, on) => {
  await startWith(
    $,
    on,
    { branch: 'release', porcelain: '', counts: '0\t0', port: '' },
    null,
  )
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await ui.find({ type: 'Text', text: /release \(protected\)/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /gate –/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /:3000 off/ })).toBeDefined()
  await ui.unmount()
})

test('a repo without .claude/frontend-kit.json shows no band', async ($, on) => {
  await startWith($, on, { branch: 'main', porcelain: '', counts: '0\t0', port: '' }, null, null)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await ui.find({ type: 'Text', text: /engine/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /⎇/ })).toBeUndefined()
  await ui.unmount()
})

const TASK_BRANCH = { branch: 'fix/1-x', porcelain: ' M a.ts', counts: '0\t1', port: '' }
const GATED = JSON.stringify({ result: 'pass', source: 'stop-hook', at: '2026-11-06T11:55:00Z', summary: 'all', fingerprint: 'aaaa1111bbbb2222' })

test('a gate on the current src/ keeps its tick', async ($, on) => {
  await startWith($, on, { ...TASK_BRANCH, fingerprint: 'aaaa1111bbbb2222' }, GATED)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await ui.find({ type: 'Text', text: /gate ✓ 5m ago/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /stale/ })).toBeUndefined()
  await ui.unmount()
})

test('a gate on older src/ shows as stale, not passed', async ($, on) => {
  await startWith($, on, { ...TASK_BRANCH, fingerprint: 'cccc3333dddd4444' }, GATED)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

  expect(await ui.find({ type: 'Text', text: /gate \? stale/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /gate ✓/ })).toBeUndefined()
  await ui.unmount()
})
