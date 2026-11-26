#!/usr/bin/env node
// Scores a project that the setup skill produced, with objective checks only (exit codes, files, a grep).
// No API calls. Used by run.mjs after each run; also runs on its own:
//
//   node scripts/setup-eval/grade.mjs <project-dir> <scenario-dir> [--transcript <stream.jsonl>] [--logs <dir>] [--skip-commands]
//
// Prints one JSON object: { checks: { name: true | false | null }, details: { name: why it failed } }.
// null means "does not apply to this foundation". The project is only read, except what its own
// commands write (build output, test caches).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STARTER_NAMES = ['my-dashboard', 'wajiha-website-starter', 'my-project'];

// The sweep of skills/setup/references/new-project-flow.md ("The sweep"), copied verbatim: same words, same noise filter.
const SWEEP =
  /warehouse|supplier|\bcategor(y|ies)\b|units?[-_ ]?of[-_ ]?measure|\buom\b|\battribute[-_ ]?(definition|data)|inventory|\bstock\b|stock_controller|storekeeper|example company|playground|مستودع|مخزون|مخازن|مخزن|تصنيف|الموردون|الموردين|وحدات القياس|شركة المثال/i;
const SWEEP_NOISE =
  /oxlint\.config\.ts:|monitoring\.test\.ts:.*category|stock Tailwind|probe-lint-boundaries\.ts:|download-file\.test\.ts:/;
const SWEEP_SKIP_DIRS = new Set(['node_modules', '.git', '.output', 'dist', '.tanstack', 'test-results']);
const SWEEP_SKIP_FILES = new Set(['package-lock.json', 'routeTree.gen.ts']);
// Not in the documented sweep: the kit's own session state (git-ignored, written by its hooks while it works).
const SWEEP_SKIP_PATHS = ['.claude/state/'];

// Where each foundation keeps what the checks look for (skills/setup/references/foundations.md).
const LAYOUT = {
  dashboard: {
    entities: {
      features: 'src/features/dashboard',
      routes: 'src/routes/_app',
      mocks: 'src/mocks/handlers',
      nav: 'src/layout/dashboard/sidebar/config/nav-config.ts',
    },
    languages: 'src/lib/i18n/languages.ts',
    switchers: [
      ['src/layout/auth/index.tsx', '<AuthLanguageSwitcher'],
      ['src/layout/dashboard/topbar/components/topbar.tsx', '<LanguageMenu'],
    ],
    demoPaths: [
      'src/features/dashboard/warehouses',
      'src/features/dashboard/suppliers',
      'src/features/dashboard/categories',
      'src/features/dashboard/units-of-measure',
      'src/routes/_app/warehouses',
      'src/routes/_app/suppliers',
      'src/routes/_app/categories',
      'src/routes/_app/attributes',
      'src/routes/_app/units-of-measure',
      'src/mocks/handlers/suppliers.ts',
      'src/mocks/handlers/warehouses.ts',
      'src/mocks/handlers/categories.ts',
      'src/mocks/handlers/attributes.ts',
      'src/mocks/handlers/units.ts',
      'src/mocks/seed/suppliers.ts',
      'src/mocks/seed/warehouses.ts',
      'src/mocks/seed/categories.ts',
      'src/mocks/seed/units.ts',
      'src/types/api/suppliers.ts',
      'src/types/api/warehouses.ts',
      'src/types/api/catalog.ts',
      'e2e/suppliers.spec.ts',
      'e2e/warehouses.spec.ts',
      'e2e/categories.spec.ts',
      'e2e/units-of-measure.spec.ts',
    ],
  },
  website: {
    pages: { features: 'src/features/website', routes: 'src/routes/$locale', nav: 'src/config/nav.config.ts' },
    languages: 'src/shared/lib/i18n/languages.ts',
    switchers: [['src/shared/components/site-header.tsx', '<LanguageSwitcher']],
    demoPaths: [],
  },
  fullstack: {
    pages: { features: 'src/features/site', routes: 'src/routes/$locale', nav: 'src/features/site/config/nav.config.ts' },
    entities: {
      features: 'src/features/admin',
      routes: 'src/routes/$locale_/admin/_shell',
      mocks: 'src/features/admin/mocks',
      nav: 'src/features/admin/layout/nav-config.ts',
    },
    languages: 'src/shared/lib/i18n/languages.ts',
    switchers: [
      ['src/features/site/layout/site-header.tsx', '<LanguageSwitcher'],
      ['src/features/admin/layout/admin-shell.tsx', '<LanguageSwitcher'],
    ],
    demoPaths: [
      'src/features/admin/suppliers',
      'src/routes/$locale_/admin/_shell/suppliers.tsx',
      'src/features/admin/mocks/suppliers.ts',
    ],
  },
};

const read = (f) => {
  try {
    return fs.readFileSync(f, 'utf8');
  } catch {
    return null;
  }
};
const readJson = (f) => {
  const text = read(f);
  if (text === null) return { error: 'missing' };
  try {
    return { value: JSON.parse(text) };
  } catch (e) {
    return { error: `not valid JSON: ${e.message}` };
  }
};
const exists = (f) => fs.existsSync(f);
const list = (d) => {
  try {
    return fs.readdirSync(d);
  } catch {
    return [];
  }
};

function walk(dir, rel = '', out = [], skipDirs = new Set()) {
  for (const entry of list(dir)) {
    const abs = path.join(dir, entry);
    const r = rel ? `${rel}/${entry}` : entry;
    let st;
    try {
      st = fs.lstatSync(abs);
    } catch {
      continue;
    }
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      if (!skipDirs.has(entry)) walk(abs, r, out, skipDirs);
    } else out.push(r);
  }
  return out;
}

/** Content hash of a folder tree: any write into it (a stray npm install in a starter, an edit) changes it. */
export function treeHash(dir) {
  const h = createHash('sha1');
  for (const r of walk(dir).sort()) {
    h.update(r);
    h.update('\0');
    try {
      h.update(fs.readFileSync(path.join(dir, r)));
    } catch {
      h.update('?');
    }
  }
  return h.digest('hex');
}

function runCommand(project, name, command, env, logs, timeoutMin) {
  const started = Date.now();
  const r = spawnSync(command, {
    cwd: project,
    shell: true,
    env: { ...process.env, CI: '1', FORCE_COLOR: '0', ...env },
    encoding: 'utf8',
    timeout: timeoutMin * 60_000,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (logs) fs.writeFileSync(path.join(logs, `${name}.log`), `$ ${command}\n${out}\nexit ${r.status} signal ${r.signal}\n`);
  const ok = r.status === 0;
  const tail = out.trim().split('\n').slice(-6).join(' | ').slice(-600);
  return { ok, why: ok ? null : r.error ? String(r.error.message) : `exit ${r.status}: ${tail}`, secs: Math.round((Date.now() - started) / 1000) };
}

function sweep(project) {
  const hits = [];
  for (const rel of walk(project, '', [], SWEEP_SKIP_DIRS)) {
    if (SWEEP_SKIP_FILES.has(path.posix.basename(rel))) continue;
    if (SWEEP_SKIP_PATHS.some((p) => rel.startsWith(p))) continue;
    let buf;
    try {
      buf = fs.readFileSync(path.join(project, rel));
    } catch {
      continue;
    }
    if (buf.includes(0)) continue; // binary, like grep -I
    const lines = buf.toString('utf8').split('\n');
    lines.forEach((line, i) => {
      if (!SWEEP.test(line)) return;
      const hit = `./${rel}:${i + 1}:${line.trim().slice(0, 160)}`;
      if (!SWEEP_NOISE.test(hit)) hits.push(hit);
    });
  }
  const locales = path.join(project, 'src/locales');
  for (const rel of walk(locales)) {
    const text = read(path.join(locales, rel)) ?? '';
    if (text.includes('"logoMark": "D"')) hits.push(`src/locales/${rel}: "logoMark": "D"`);
  }
  return hits;
}

const inside = (child, parent) => {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

// A Git Bash path (/c/Users/...) as the transcript may hold it, as a native path.
const nativePath = (p) => (process.platform === 'win32' ? p.replace(/^\/([a-zA-Z])\//, '$1:/') : p);

/** File paths the session wrote with its file tools, from a stream-json transcript. */
export function writtenPaths(transcript) {
  const text = transcript ? read(transcript) : null;
  if (!text) return null;
  const paths = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('{')) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    for (const part of msg?.message?.content ?? []) {
      if (part?.type === 'tool_use' && ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(part.name)) {
        const p = part.input?.file_path ?? part.input?.notebook_path;
        if (p) paths.push(p);
      }
    }
  }
  return paths;
}

function matchEntry(dir, match) {
  const re = new RegExp(match, 'i');
  return list(dir).filter((e) => re.test(e));
}

export function grade({ project, scenarioDir, transcript, logs, skipCommands = false, sandbox, pluginBefore, pluginAfter }) {
  const scenario = JSON.parse(read(path.join(scenarioDir, 'scenario.json')));
  const f = scenario.foundation;
  const L = LAYOUT[f];
  const exp = scenario.expect;
  const p = (rel) => path.join(project, rel);
  const checks = {};
  const details = {};
  const set = (name, ok, why) => {
    checks[name] = ok;
    if (ok === false && why) details[name] = why;
  };
  if (logs) fs.mkdirSync(logs, { recursive: true });

  // --- files the kit writes
  {
    const { value: cfg, error } = readJson(p('.claude/wajiha-kit.json'));
    const why = [];
    if (error) why.push(`wajiha-kit.json ${error}`);
    else {
      if (cfg.mode !== 'new') why.push(`mode is ${JSON.stringify(cfg.mode)}`);
      if (cfg.profile !== f) why.push(`profile is ${JSON.stringify(cfg.profile)}`);
      if (typeof cfg.devPort !== 'string') why.push('devPort is not a string');
      for (const k of ['typecheck', 'lint', 'test', 'build']) if (!cfg.commands?.[k]) why.push(`commands.${k} missing`);
      if (typeof cfg.stack !== 'object' || !cfg.stack) why.push('stack missing');
      if (!Array.isArray(cfg.protectedBranches)) why.push('protectedBranches is not a list');
      if (f === 'fullstack' && !(Array.isArray(cfg.apps) && cfg.apps.length === 2)) why.push('apps is not the two apps');
    }
    set('kitConfig', why.length === 0, why.join('; '));
  }
  {
    const why = [];
    if (!exists(p('CLAUDE.md'))) why.push('no CLAUDE.md');
    const rules = list(p('.claude/rules')).filter((e) => e.endsWith('.md'));
    if (rules.length < 3) why.push(`${rules.length} rules in .claude/rules`);
    if (!rules.includes('git.md')) why.push('no .claude/rules/git.md');
    const s = readJson(p('.claude/settings.json'));
    if (s.error) why.push(`settings.json ${s.error}`);
    const placeholders = [];
    for (const rel of ['CLAUDE.md', ...walk(p('.claude')).map((r) => `.claude/${r}`)]) {
      if (rel.startsWith('.claude/state/')) continue;
      const m = (read(p(rel)) ?? '').match(/\{\{[A-Z0-9_]+\}\}/g);
      if (m) placeholders.push(`${rel}: ${[...new Set(m)].join(' ')}`);
    }
    if (placeholders.length) why.push(`placeholders left: ${placeholders.join('; ')}`);
    set('claudeFiles', why.length === 0, why.join('; '));
  }
  {
    const gi = (read(p('.gitignore')) ?? '').split(/\r?\n/).map((l) => l.trim());
    const missing = ['.claude/state/', '.claude/settings.local.json'].filter(
      (want) => !gi.includes(want) && !gi.includes(want.replace(/\/$/, '')) && !gi.includes(`/${want}`),
    );
    set('gitignore', missing.length === 0, `not in .gitignore: ${missing.join(', ')}`);
  }
  {
    const pkg = readJson(p('package.json'));
    const lock = readJson(p('package-lock.json'));
    const why = [];
    const name = pkg.value?.name;
    if (!name) why.push('package.json has no name');
    else {
      if (STARTER_NAMES.includes(name)) why.push(`still the starter name ${name}`);
      if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) why.push(`name ${name} is not a kebab-case slug`);
      if (lock.value?.name !== name) why.push(`lockfile name is ${lock.value?.name}`);
    }
    set('renamed', why.length === 0, why.join('; '));
  }
  {
    if (!exists(p('.git'))) set('noCommits', true);
    else {
      const r = spawnSync('git', ['rev-list', '--all', '--count'], { cwd: project, encoding: 'utf8' });
      const n = Number((r.stdout ?? '').trim() || 0);
      set('noCommits', n === 0, `${n} commit(s) in the project`);
    }
  }

  // --- content from the answers
  if (exp.openapiPath) {
    const { value, error } = readJson(p('docs/api/openapi.json'));
    set('openapi', !error && Boolean(value.openapi || value.swagger) && Boolean(value.paths?.[exp.openapiPath]), error ?? 'not the scenario spec');
  } else checks.openapi = null;

  if (exp.entities && L.entities) {
    const E = L.entities;
    const why = [];
    const nav = read(p(E.nav)) ?? '';
    for (const ent of exp.entities) {
      if (!matchEntry(p(E.features), ent.match).length) why.push(`${ent.name}: no feature in ${E.features}`);
      if (!matchEntry(p(E.routes), ent.match).length) why.push(`${ent.name}: no route in ${E.routes}`);
      const mockHit =
        matchEntry(p(E.mocks), ent.match).length ||
        walk(p(E.mocks)).some((r) => new RegExp(ent.match, 'i').test(read(path.join(p(E.mocks), r)) ?? ''));
      if (!mockHit) why.push(`${ent.name}: no mock in ${E.mocks}`);
      if (!new RegExp(ent.match, 'i').test(nav)) why.push(`${ent.name}: not in ${E.nav}`);
    }
    set('entities', why.length === 0, why.join('; '));
  } else checks.entities = null;

  if (exp.pages && L.pages) {
    const P = L.pages;
    const why = [];
    const nav = read(p(P.nav)) ?? '';
    for (const page of exp.pages) {
      if (page.route === 'index') {
        if (!exists(p(`${P.routes}/index.tsx`))) why.push(`${page.name}: no ${P.routes}/index.tsx`);
        continue;
      }
      if (!matchEntry(p(P.routes), page.match).length) why.push(`${page.name}: no route in ${P.routes}`);
      if (!matchEntry(p(P.features), page.match).length) why.push(`${page.name}: no feature in ${P.features}`);
      if (!new RegExp(page.match, 'i').test(nav)) why.push(`${page.name}: not in ${P.nav}`);
    }
    for (const gone of exp.gonePages ?? []) {
      const left = [...matchEntry(p(P.routes), `^${gone}`), ...matchEntry(p(P.features), `^${gone}$`)];
      if (left.length) why.push(`demo page ${gone} still there (${left.join(', ')})`);
    }
    set('pages', why.length === 0, why.join('; '));
  } else checks.pages = null;

  {
    const left = L.demoPaths.filter((rel) => exists(p(rel)));
    set('demoGone', left.length === 0, `still there: ${left.join(', ')}`);
  }
  {
    const hits = sweep(project);
    if (logs) fs.writeFileSync(path.join(logs, 'sweep.log'), `${hits.join('\n')}\n`);
    set('leakSweep', hits.length === 0, `${hits.length} hit(s): ${hits.slice(0, 5).join(' || ')}`);
  }
  {
    const why = [];
    const text = read(p(L.languages));
    if (text === null) why.push(`no ${L.languages}`);
    else {
      const codes =
        f === 'dashboard'
          ? [...(text.match(/LANGUAGES\s*=\s*\{([\s\S]*?)\}\s*as const/)?.[1] ?? '').matchAll(/^\s*([a-z]{2}):/gm)].map((m) => m[1])
          : [...(text.match(/LOCALES\s*=\s*\[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z]{2})'/g)].map((m) => m[1]);
      const def = text.match(/DEFAULT_(?:LANGUAGE|LOCALE)\s*:\s*\w+\s*=\s*'([a-z]{2})'/)?.[1];
      for (const c of exp.languages) if (!codes.includes(c)) why.push(`${c} not in the languages list (${codes.join(',')})`);
      if (def !== exp.defaultLanguage) why.push(`default is ${def}, wanted ${exp.defaultLanguage}`);
    }
    for (const [rel, mount] of L.switchers) {
      const mounted = (read(p(rel)) ?? '').includes(mount);
      if (mounted !== exp.switcher) why.push(`${rel}: language switcher ${mounted ? 'still mounted' : 'missing'}`);
    }
    set('languages', why.length === 0, why.join('; '));
  }

  // --- nothing written outside the project
  {
    const why = [];
    const written = writtenPaths(transcript);
    if (written === null) why.push('no transcript to check');
    else {
      const outside = written.filter((w) => !inside(path.resolve(project, nativePath(w)), project));
      if (outside.length) why.push(`file tools wrote outside: ${[...new Set(outside)].slice(0, 5).join(', ')}`);
    }
    if (sandbox) {
      const extra = list(sandbox).filter((e) => e !== path.basename(project));
      if (extra.length) why.push(`new next to the project: ${extra.join(', ')}`);
    }
    if (pluginBefore && pluginAfter && pluginBefore !== pluginAfter) why.push('the plugin folder (starters, skills) changed');
    set('noOutsideWrites', why.length === 0, why.join('; '));
  }

  // --- the foundation's own checks
  const names = ['typecheck', 'lint', 'fmt', 'tests', 'i18n', 'boundaries', 'build'];
  if (skipCommands || !exists(p('node_modules'))) {
    for (const n of names) {
      checks[n] = n === 'boundaries' && f !== 'fullstack' ? null : skipCommands ? null : false;
      if (!skipCommands && checks[n] === false) details[n] = 'no node_modules (npm install did not run)';
    }
  } else {
    const buildEnv = f === 'dashboard' ? {} : { VITE_SITE_URL: 'http://localhost:5190', VITE_ALLOW_INDEXING: 'false' };
    const cmds = [
      ['typecheck', 'npm run typecheck', {}, 10],
      ['lint', 'npm run lint:check', {}, 10],
      ['fmt', 'npm run fmt:check', {}, 10],
      ['tests', 'npm run test', {}, 25],
      ['i18n', 'npm run i18n:validate', {}, 5],
      ['boundaries', f === 'fullstack' ? 'npm run check:boundaries' : null, {}, 10],
      ['build', 'npm run build', buildEnv, 15],
    ];
    const timing = {};
    for (const [name, cmd, env, min] of cmds) {
      if (!cmd) {
        checks[name] = null;
        continue;
      }
      const r = runCommand(project, name, cmd, env, logs, min);
      set(name, r.ok, r.why);
      timing[name] = r.secs;
    }
    details._commandSecs = timing;
  }
  return { scenario: scenario.id, foundation: f, checks, details };
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const valued = ['--transcript', '--logs', '--sandbox', '--plugin-before', '--plugin-after'];
  const positional = args.filter((a, i) => !a.startsWith('--') && !valued.includes(args[i - 1]));
  if (positional.length < 2) {
    console.error('usage: node grade.mjs <project-dir> <scenario-dir> [--transcript <file>] [--logs <dir>] [--skip-commands]');
    process.exit(64);
  }
  const result = grade({
    project: path.resolve(positional[0]),
    scenarioDir: path.resolve(positional[1]),
    transcript: opt('--transcript'),
    logs: opt('--logs'),
    skipCommands: args.includes('--skip-commands'),
    // set by run.mjs: the temp folder holding only the project, and the plugin tree's hash before and after the run
    sandbox: opt('--sandbox'),
    pluginBefore: opt('--plugin-before'),
    pluginAfter: opt('--plugin-after'),
  });
  console.log(JSON.stringify(result));
}
