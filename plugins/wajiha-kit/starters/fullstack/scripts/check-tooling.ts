// Fails when a tool is configured but not wired (the "dead config" trap), or when a secret file could be
// committed. Run: npm run check:tooling. Node strips the types: keep this file erasable-syntax only.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const problems: string[] = [];
const need = (condition: boolean, message: string): void => {
  if (!condition) {
    problems.push(message);
  }
};

const pkg: { scripts?: Record<string, string>; engines?: Record<string, string> } = JSON.parse(
  readFileSync('package.json', 'utf8'),
);
const scripts = pkg.scripts ?? {};

// 1. Hooks: the config files, the hook files and the install step all exist together.
need(existsSync('.husky/pre-commit'), '.husky/pre-commit is missing');
need(existsSync('.husky/commit-msg'), '.husky/commit-msg is missing');
need(existsSync('.lintstagedrc.json'), '.lintstagedrc.json is missing');
need(existsSync('commitlint.config.ts'), 'commitlint.config.ts is missing');
need(
  scripts.prepare !== undefined,
  'package.json has no "prepare" script, so hooks are never installed',
);
need(
  readFileSync('.husky/pre-commit', 'utf8').includes('lint-staged'),
  '.husky/pre-commit does not run lint-staged',
);
need(
  readFileSync('.husky/commit-msg', 'utf8').includes('commitlint'),
  '.husky/commit-msg does not run commitlint',
);

// 2. Every tool has its config.
for (const file of [
  'oxlint.config.ts',
  'oxfmt.config.ts',
  'vitest.config.ts',
  'playwright.config.ts',
  '.env.example',
]) {
  need(existsSync(file), `${file} is missing`);
}
need(
  pkg.engines?.node !== undefined && existsSync('.nvmrc'),
  'Node is not pinned (.nvmrc + engines.node)',
);

// 3. CI runs every gate. A command that exists but never runs in CI protects nobody.
const ci = existsSync('.github/workflows/ci.yml')
  ? readFileSync('.github/workflows/ci.yml', 'utf8')
  : '';
need(ci !== '', '.github/workflows/ci.yml is missing');
const PATTERNS: Record<string, string> = { test: 'test(:coverage)?', build: 'build(:proof)?' };
for (const command of [
  'typecheck',
  'lint:check',
  'fmt:check',
  'i18n:validate',
  'check:env',
  'check:css',
  'check:tooling',
  'test',
  'build',
  'build:proof',
  'check:bundle',
  'check:boundaries',
  'test:e2e',
]) {
  need(scripts[command] !== undefined, `package.json has no "${command}" script`);
  need(
    // "test" is satisfied by the coverage run, which executes the same tests plus the thresholds, and
    // "build" by "build:proof" (the same build plus the source maps the bundle check reads).
    new RegExp(`npm run ${PATTERNS[command] ?? command}(\\s|$)`, 'm').test(ci),
    `ci.yml never runs "npm run ${command}"`,
  );
}

// 4. No env file can be committed except the example.
const gitignore = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8') : '';
need(
  /^\.env$/m.test(gitignore) && /^\.env\.\*$/m.test(gitignore),
  '.gitignore must ignore .env and .env.*',
);
need(/^!\.env\.example$/m.test(gitignore), '.gitignore must keep .env.example');
const git = spawnSync('git', ['ls-files', '--', '.env*'], { encoding: 'utf8' });
if (git.status === 0) {
  const tracked = git.stdout
    .split(/\r?\n/)
    .filter((file) => file !== '' && !file.endsWith('.env.example'));
  need(tracked.length === 0, `env files are tracked by git: ${tracked.join(', ')}`);
}
const strayEnv = readdirSync('.').filter((file) =>
  /^\.env\.(production|staging|development)$/.test(file),
);
need(
  strayEnv.length === 0,
  `committed-style env files found: ${strayEnv.join(', ')} (use .env.local, which is ignored)`,
);

// 5. Every "npm run <script>" written in the docs, comments and messages exists. A guide that sends people
// to a missing script (it happened with "npm run tokens") fails here, not in front of a beginner.
function* filesUnder(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.output' && entry.name !== 'coverage') {
        yield* filesUnder(path);
      }
    } else if (/\.(md|ts|tsx|mjs|css|json|yml|example)$/.test(entry.name)) {
      yield path;
    }
  }
}
const documented = ['src', 'scripts', 'e2e', '.claude', '.github'].filter((dir) => existsSync(dir));
const rootFiles = ['STRUCTURE.md', 'CLAUDE.md', '.env.example', 'oxfmt.config.ts'].filter((file) =>
  existsSync(file),
);
const NPM_RUN = /npm run ([a-z][a-z0-9:-]*)/g;
const reported = new Set<string>();
const filesToScan = [...rootFiles];
for (const dir of documented) {
  for (const file of filesUnder(dir)) {
    filesToScan.push(file);
  }
}
for (const file of filesToScan) {
  if (file.endsWith('scripts/check-tooling.ts')) {
    continue;
  }
  for (const match of readFileSync(file, 'utf8').matchAll(NPM_RUN)) {
    const name = match[1];
    if (name !== undefined && scripts[name] === undefined && !reported.has(`${file}:${name}`)) {
      reported.add(`${file}:${name}`);
      problems.push(
        `${file} tells people to run "npm run ${name}", which package.json does not have`,
      );
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`error ${problem}`);
  }
  console.error(`\ncheck:tooling failed with ${problems.length} problem(s)`);
  process.exit(1);
}
console.log('check:tooling ok: hooks, configs, CI gates and env-file rules are wired');
