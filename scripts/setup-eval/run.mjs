#!/usr/bin/env node
// End-to-end eval of the setup skill's new-project path: for each scenario, a fresh temp folder, one headless
// `claude -p "/wajiha-kit:setup ..."` run with all five answers up front, then grade.mjs on what it left behind.
// EVERY run calls the API and costs money (capped per run by --budget).
//
//   node scripts/setup-eval/run.mjs [--scenario <id>]... [--runs 2] [--parallel 1] [--budget 8] [--timeout-min 120]
//                                   [--model <id>] [--out <dir>] [--keep]
//
// Writes <out>/results.jsonl (one line per run, appended) and <out>/runs/<run id>/ (prompt, transcript, check logs).
// Default <out>: <os temp>/wajiha-setup-eval-results. Projects are deleted after grading unless --keep.
// Claude Code: CLAUDE_BIN, else ~/.local/bin/claude(.exe), else `claude` on PATH.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { treeHash } from './grade.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PLUGIN = path.join(ROOT, 'plugins', 'wajiha-kit');
const SCENARIOS = path.join(HERE, 'scenarios');
const PREFIX = 'wajiha-setup-eval-';

// ---- options
const argv = process.argv.slice(2);
const opts = { scenarios: [], runs: 2, parallel: 1, budget: 8, timeoutMin: 120, model: null, keep: false, out: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const next = () => {
    const v = argv[++i];
    if (v === undefined) usage(`${a} needs a value`);
    return v;
  };
  if (a === '--scenario') opts.scenarios.push(next());
  else if (a === '--runs') opts.runs = Number(next());
  else if (a === '--parallel') opts.parallel = Number(next());
  else if (a === '--budget') opts.budget = Number(next());
  else if (a === '--timeout-min') opts.timeoutMin = Number(next());
  else if (a === '--model') opts.model = next();
  else if (a === '--out') opts.out = path.resolve(next());
  else if (a === '--keep') opts.keep = true;
  else usage(`unknown option ${a}`);
}
function usage(msg) {
  if (msg) console.error(`setup-eval: ${msg}`);
  console.error(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'));
  process.exit(64);
}
const all = fs.readdirSync(SCENARIOS).filter((d) => fs.existsSync(path.join(SCENARIOS, d, 'scenario.json')));
if (!opts.scenarios.length) opts.scenarios = all;
for (const s of opts.scenarios) if (!all.includes(s)) usage(`no scenario ${s} (have: ${all.join(', ')})`);
for (const [k, v] of Object.entries({ runs: opts.runs, parallel: opts.parallel, budget: opts.budget, timeoutMin: opts.timeoutMin }))
  if (!(v > 0)) usage(`--${k} must be a positive number`);
opts.out ??= path.join(os.tmpdir(), 'wajiha-setup-eval-results');
fs.mkdirSync(path.join(opts.out, 'runs'), { recursive: true });
const RESULTS = path.join(opts.out, 'results.jsonl');

function claudeBin() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const local = path.join(os.homedir(), '.local', 'bin', process.platform === 'win32' ? 'claude.exe' : 'claude');
  return fs.existsSync(local) ? local : 'claude';
}

// Started from inside a Claude Code session (an agent running this eval), the parent's session variables would
// leak into the child and point it at the parent's host. The child gets the user's own login instead.
function childEnv() {
  const env = { ...process.env };
  const nested = Boolean(env.CLAUDECODE || env.CLAUDE_CODE_ENTRYPOINT);
  if (!nested) return env;
  for (const k of Object.keys(env)) {
    if (/^(CLAUDECODE|CLAUDE_CODE_.*|CLAUDE_AGENT_SDK_.*|CLAUDE_PID|CLAUDE_EFFORT|CLAUDE_PREVIEW_.*)$/.test(k)) delete env[k];
  }
  if (process.env.CLAUDE_CODE_ENTRYPOINT) delete env.ANTHROPIC_BASE_URL; // injected by the host app, not the user's
  return env;
}

// What the child may do. File tools, and shell commands for the build; no WebFetch, no MCP, no subagents.
// Paths outside the project still need a permission no one can give in -p, so they are refused.
const ALLOWED = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'TodoWrite',
  'Bash(npm *)', 'Bash(npx *)', 'Bash(node *)', 'Bash(git *)', 'Bash(tar *)',
  'Bash(mkdir *)', 'Bash(cp *)', 'Bash(mv *)', 'Bash(rm *)', 'Bash(ls)', 'Bash(ls *)', 'Bash(cat *)',
  // read-only helpers the setup references use (the sweep is a grep; the spec check is jq)
  'Bash(grep *)', 'Bash(jq *)', 'Bash(comm *)', 'Bash(command -v *)', 'Bash(head *)', 'Bash(tail *)', 'Bash(wc *)', 'Bash(diff *)',
];

function prompt(scenario) {
  const a = scenario.answers;
  return [
    '/wajiha-kit:setup',
    '',
    'This folder is empty apart from what I put in it. Here are all my answers up front.',
    '',
    "What are we doing: a new project, on the kit's own stack (no other framework).",
    `1. What do you want to build? ${a[0]}`,
    `2. Tell me about your project: ${a[1]}`,
    `3. Design: ${a[2]}`,
    `4. OpenAPI / backend: ${a[3]}`,
    `5. Languages: ${a[4]}`,
    '',
    'Take your proposed project name and your defaults for everything else: yes to git init, yes to the .gitignore lines,',
    'no to browser checks and to library docs lookup. Write the summary, then go ahead without waiting for my',
    'confirmation: my answer is yes.',
    'This is an unattended run: nobody can answer a question. Never stop to ask; where a step would ask me, take its',
    'default and say so in the final report. Skip step 11 (do not start a dev server) and do not install or run',
    'Playwright; every other step, including the checks and the build until green, is required.',
  ].join('\n');
}

function killTree(child) {
  if (!child.pid) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
  else {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
  }
}

function lastResult(transcript) {
  let result = null;
  const text = fs.existsSync(transcript) ? fs.readFileSync(transcript, 'utf8') : '';
  for (const line of text.split('\n')) {
    if (!line.startsWith('{')) continue;
    try {
      const m = JSON.parse(line);
      if (m.type === 'result') result = m;
    } catch {
      /* a partial line from a killed run */
    }
  }
  return result;
}

async function runOne(scenarioId, n) {
  const scenarioDir = path.join(SCENARIOS, scenarioId);
  const scenario = JSON.parse(fs.readFileSync(path.join(scenarioDir, 'scenario.json'), 'utf8'));
  const runId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${scenarioId}-${n}`;
  const runDir = path.join(opts.out, 'runs', runId);
  fs.mkdirSync(runDir, { recursive: true });

  // The project folder: only ever inside the folder mkdtemp just made (checked before anything is written or deleted).
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), PREFIX));
  const base = path.basename(sandbox);
  if (!base.startsWith(PREFIX) || base.length <= PREFIX.length || path.resolve(sandbox) === path.resolve(os.tmpdir()))
    throw new Error(`setup-eval: bad temp folder ${sandbox}`);
  const project = path.join(sandbox, scenario.folder);
  fs.mkdirSync(project);
  // A parent git repository would catch the child's git commands.
  const parentRepo = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: project, encoding: 'utf8' });
  if (parentRepo.status === 0) throw new Error(`setup-eval: the temp folder is inside a git repository (${parentRepo.stdout.trim()})`);
  for (const [to, from] of Object.entries(scenario.files ?? {})) {
    fs.mkdirSync(path.dirname(path.join(project, to)), { recursive: true });
    fs.copyFileSync(path.join(scenarioDir, from), path.join(project, to));
  }

  const text = prompt(scenario);
  fs.writeFileSync(path.join(runDir, 'prompt.txt'), `${text}\n`);
  const args = [
    '-p', text, '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits',
    '--setting-sources', 'project', '--strict-mcp-config', '--no-session-persistence',
    '--max-budget-usd', String(opts.budget), '--plugin-dir', PLUGIN, '--allowedTools', ...ALLOWED,
  ];
  if (opts.model) args.push('--model', opts.model);

  const pluginBefore = treeHash(PLUGIN);
  const transcript = path.join(runDir, 'transcript.jsonl');
  const started = Date.now();
  log(`${runId}: started in ${project}`);
  const timedOut = await new Promise((resolve) => {
    const outFile = fs.openSync(transcript, 'w');
    const errFile = fs.openSync(path.join(runDir, 'stderr.txt'), 'w');
    const child = spawn(claudeBin(), args, {
      cwd: project,
      env: childEnv(),
      stdio: ['ignore', outFile, errFile],
      detached: process.platform !== 'win32',
      windowsHide: true,
    });
    let late = false;
    const timer = setTimeout(() => {
      late = true;
      log(`${runId}: timed out after ${opts.timeoutMin} min, stopping it`);
      killTree(child);
    }, opts.timeoutMin * 60_000);
    child.on('error', (e) => {
      fs.appendFileSync(path.join(runDir, 'stderr.txt'), `spawn error: ${e.message}\n`);
    });
    child.on('close', () => {
      clearTimeout(timer);
      fs.closeSync(outFile);
      fs.closeSync(errFile);
      resolve(late);
    });
  });
  const minutes = Math.round((Date.now() - started) / 600) / 100;
  const pluginAfter = treeHash(PLUGIN);
  const res = lastResult(transcript) ?? {};
  log(`${runId}: session ended after ${minutes} min, ${res.total_cost_usd ?? '?'} USD; grading`);

  const graded = await gradeAsync([project, scenarioDir, '--transcript', transcript, '--logs', path.join(runDir, 'checks'),
    '--sandbox', sandbox, '--plugin-before', pluginBefore, '--plugin-after', pluginAfter]);
  const failed = Object.entries(graded.checks).filter(([, v]) => v === false).map(([k]) => k);
  const line = {
    scenario: scenarioId,
    run: n,
    runId,
    pass: failed.length === 0,
    failed,
    checks: graded.checks,
    costUsd: res.total_cost_usd ?? null,
    minutes,
    turns: res.num_turns ?? null,
    stop: timedOut ? 'timeout' : (res.subtype ?? 'no result'),
    isError: res.is_error ?? null,
    models: Object.keys(res.modelUsage ?? {}),
    permissionDenials: (res.permission_denials ?? []).map((d) => `${d.tool_name}: ${JSON.stringify(d.tool_input).slice(0, 160)}`),
    details: graded.details,
    finalMessage: typeof res.result === 'string' ? res.result.slice(0, 1500) : null,
    project: opts.keep ? project : null,
    runDir,
  };
  fs.appendFileSync(RESULTS, `${JSON.stringify(line)}\n`);
  log(`${runId}: ${line.pass ? 'PASS' : `FAIL (${failed.join(', ')})`}`);
  if (!opts.keep) fs.rmSync(sandbox, { recursive: true, force: true });
  return line;
}

// Grading runs the project's builds and tests (minutes): in its own process, so parallel runs keep their timers.
function gradeAsync(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(HERE, 'grade.mjs'), ...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => {
      try {
        resolve(JSON.parse(out.trim().split('\n').pop()));
      } catch {
        resolve({ checks: { grader: false }, details: { grader: `grade.mjs exit ${code}: ${err.slice(-500)}` } });
      }
    });
  });
}

function log(msg) {
  process.stderr.write(`[${new Date().toLocaleTimeString()}] ${msg}\n`);
}

// ---- jobs: each scenario --runs times, at most --parallel at once
const jobs = [];
for (let n = 1; n <= opts.runs; n++) for (const s of opts.scenarios) jobs.push([s, n]);
log(`${jobs.length} run(s), up to ${opts.parallel} at once, budget ${opts.budget} USD each (at most ${jobs.length * opts.budget} USD); results: ${RESULTS}`);
const lines = [];
async function worker() {
  while (jobs.length) {
    const [s, n] = jobs.shift();
    try {
      lines.push(await runOne(s, n));
    } catch (e) {
      log(`${s} #${n}: ${e.message}`);
      fs.appendFileSync(RESULTS, `${JSON.stringify({ scenario: s, run: n, pass: false, error: e.message })}\n`);
    }
  }
}
await Promise.all(Array.from({ length: Math.min(opts.parallel, jobs.length) }, worker));
const cost = lines.reduce((sum, l) => sum + (l.costUsd ?? 0), 0);
log(`done: ${lines.filter((l) => l.pass).length}/${lines.length} passed, ${cost.toFixed(2)} USD`);
