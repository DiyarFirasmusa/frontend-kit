/**
 * Proves the layer-boundary lint rule fires. It writes temporary files that
 * break the rule, at every folder depth and with both `@/` and relative
 * imports, runs oxlint on them and fails unless every one of them is reported
 * (and unless the allowed imports stay clean). The files are always removed.
 * Run with `npm run lint:probe`; it is part of `npm run check`.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';
import {
  FEATURE_ROOTS,
  FEATURES_DIR,
  MAX_FEATURE_DEPTH,
  SHARED_DIRS,
  SHARED_FEATURE,
} from '../oxlint.config.ts';

const PROBE_DIR = '__boundary_probe__';
const PROBE_FILE_PREFIX = '__probe-';
const RULE = 'no-restricted-imports';
const OXLINT_BIN = 'node_modules/oxlint/bin/oxlint';

interface Probe {
  /** Path of the temporary file, relative to the project root. */
  file: string;
  /** The import it makes. */
  specifier: string;
  /** What the rule must do with it. */
  expect: 'blocked' | 'allowed';
  /** Why, for the failure message. */
  why: string;
}

type Made = Omit<Probe, 'file' | 'specifier'>;

const otherFeature = (root: string): string | undefined =>
  FEATURE_ROOTS.find((other) => other !== root && other !== SHARED_FEATURE);

function sharedProbes(): Probe[] {
  const target = otherFeature('');
  if (!target) {
    return [];
  }
  const probes: Probe[] = [];
  for (const dir of SHARED_DIRS.filter((name) => existsSync(`src/${name}`))) {
    const base = `src/${dir}/${PROBE_DIR}`;
    // `nest` folders below the probe folder; `ups` reaches `src/`.
    for (const nest of [0, 1, 3]) {
      const ups = '../'.repeat(nest + 2);
      const folder = `${base}/${'n/'.repeat(nest)}`;
      const cases: [string, string][] = [
        [`@/features/${target}/types/types`, 'alias, deep path'],
        ['@/features', 'alias, features root'],
        ['@/layout/dashboard', 'alias, layout'],
        ['@/routes/__root', 'alias, route'],
        [`${ups}features/${target}/types/types`, 'relative, deep path'],
        [`${ups}layout/dashboard`, 'relative, layout'],
      ];
      for (const [index, [specifier, why]] of cases.entries()) {
        probes.push({
          file: `${folder}probe-${index}.ts`,
          specifier,
          expect: 'blocked',
          why: `src/${dir} (${nest} folders deep): ${why}`,
        });
      }
    }
    probes.push(
      {
        file: `${base}/probe.test.ts`,
        specifier: `@/features/${target}/types/types`,
        expect: 'blocked',
        why: `src/${dir}: a test file is held to the same boundary`,
      },
      {
        file: `${base}/probe-ok.ts`,
        specifier: '@/lib/utils',
        expect: 'allowed',
        why: `src/${dir}: importing shared code is fine`,
      },
    );
  }
  return probes;
}

function featureProbes(): Probe[] {
  const probes: Probe[] = [];
  for (const root of FEATURE_ROOTS) {
    const target = otherFeature(root);
    // `at` = how many folders below the feature root the probe file sits.
    for (let at = 0; at <= MAX_FEATURE_DEPTH; at += 1) {
      const dir =
        at === 0
          ? `${FEATURES_DIR}/${root}/`
          : `${FEATURES_DIR}/${root}/${PROBE_DIR}/${'d/'.repeat(at - 1)}`;
      const name = at === 0 ? PROBE_FILE_PREFIX : '';
      const where = `${root}, ${at} folders deep`;
      const make = (file: string, specifier: string, made: Made) =>
        probes.push({ file: `${dir}${name}${file}.ts`, specifier, ...made });
      if (target) {
        make('alias', `@/features/${target}/types/types`, {
          expect: 'blocked',
          why: `${where}: alias to another feature`,
        });
      }
      make('layout', '@/layout/dashboard', {
        expect: 'blocked',
        why: `${where}: alias to a layout`,
      });
      make('route', '@/routes/__root', {
        expect: 'blocked',
        why: `${where}: alias to a route`,
      });
      make('rel-out', `${'../'.repeat(at + 1)}other/types`, {
        expect: 'blocked',
        why: `${where}: relative path leaving the feature folder`,
      });
      make('rel-in', `${at === 0 ? './' : '../'.repeat(at)}types/types`, {
        expect: 'allowed',
        why: `${where}: relative path inside the feature`,
      });
      make('own', `@/features/${root}/types/types`, {
        expect: 'allowed',
        why: `${where}: alias to its own folder`,
      });
      make('shared', '@/lib/utils', {
        expect: 'allowed',
        why: `${where}: shared code`,
      });
      if (root !== SHARED_FEATURE) {
        make('fallback', `@/features/${SHARED_FEATURE}/error-page`, {
          expect: 'allowed',
          why: `${where}: the shared error screens`,
        });
      }
    }
    // Tests are held to the boundary too.
    if (target) {
      probes.push({
        file: `${FEATURES_DIR}/${root}/${PROBE_DIR}/probe.test.ts`,
        specifier: `@/features/${target}/types/types`,
        expect: 'blocked',
        why: `${root}: a test file importing another feature`,
      });
    }
  }
  return probes;
}

function apiProbes(): Probe[] {
  const cases: [string, string][] = [
    ['@/components/ui/button', 'alias, UI'],
    ['@/hooks/use-me', 'alias, hooks'],
    ['@/features/auth/session/bootstrap-session', 'alias, feature'],
    ['../../components/ui/button', 'relative, UI'],
  ];
  return cases.map(([specifier, why], index) => ({
    file: `src/api/${PROBE_DIR}/probe-${index}.ts`,
    specifier,
    expect: 'blocked',
    why: `src/api: ${why}`,
  }));
}

/** Folders that hold probe files, and the loose files in feature roots. */
function probeLocations(probes: Probe[]): { dirs: string[]; files: string[] } {
  return {
    dirs: [
      ...SHARED_DIRS.map((dir) => `src/${dir}/${PROBE_DIR}`),
      ...FEATURE_ROOTS.map((root) => `${FEATURES_DIR}/${root}/${PROBE_DIR}`),
      `src/api/${PROBE_DIR}`,
    ],
    files: probes
      .map((probe) => probe.file)
      .filter((file) => file.includes(PROBE_FILE_PREFIX)),
  };
}

function write(probe: Probe): void {
  mkdirSync(dirname(probe.file), { recursive: true });
  writeFileSync(
    probe.file,
    `import type * as Probe from '${probe.specifier}';\n\nexport type Subject = typeof Probe;\n`,
  );
}

interface Diagnostic {
  code?: string;
  filename?: string;
}

/** Keeps each command line short enough for Windows (about 8,000 characters). */
function chunk(files: string[]): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let length = 0;
  for (const file of files) {
    if (length + file.length > 6000 && current.length > 0) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(file);
    length += file.length + 1;
  }
  return current.length > 0 ? [...chunks, current] : chunks;
}

/**
 * The files oxlint reports for the boundary rule. Files are passed one by one:
 * oxlint skips whole folders a parent `.gitignore` hides (the starter lives
 * under the kit's gitignored `playground/`), but not explicit file paths.
 */
function reportedFiles(files: string[]): Set<string> {
  const reported = new Set<string>();
  for (const group of chunk(files)) {
    const run = spawnSync(
      process.execPath,
      [OXLINT_BIN, '--format', 'json', '--no-ignore', ...group],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    const parsed: unknown = JSON.parse(
      run.stdout.slice(run.stdout.indexOf('{')),
    );
    const diagnostics: Diagnostic[] =
      typeof parsed === 'object' &&
      parsed !== null &&
      'diagnostics' in parsed &&
      Array.isArray(parsed.diagnostics)
        ? parsed.diagnostics
        : [];
    for (const item of diagnostics) {
      if (item.code?.includes(RULE)) {
        reported.add((item.filename ?? '').replaceAll('\\', '/'));
      }
    }
  }
  return reported;
}

/** The rule is generated per folder depth: a real file deeper than that is unprotected. */
function tooDeepFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string, depth: number) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(`${dir}/${entry.name}`, depth + 1);
      } else if (depth > MAX_FEATURE_DEPTH) {
        found.push(`${dir}/${entry.name}`);
      }
    }
  };
  for (const root of FEATURE_ROOTS) {
    walk(`${FEATURES_DIR}/${root}`, 0);
  }
  return found;
}

function main(): number {
  const deep = tooDeepFiles();
  if (deep.length > 0) {
    console.error(
      `Files deeper than ${MAX_FEATURE_DEPTH} folders inside a feature are not covered by the boundary rule (raise MAX_FEATURE_DEPTH in oxlint.config.ts):\n${deep.join('\n')}`,
    );
    return 1;
  }
  const probes = [...sharedProbes(), ...featureProbes(), ...apiProbes()];
  const { dirs, files } = probeLocations(probes);
  const cleanUp = () => {
    for (const path of [...dirs, ...files]) {
      rmSync(path, { recursive: true, force: true });
    }
  };
  cleanUp();
  try {
    for (const probe of probes) {
      write(probe);
    }
    const reported = reportedFiles(probes.map((probe) => probe.file));
    const wrong = probes.filter((probe) => {
      const hit = [...reported].some((file) => file.endsWith(probe.file));
      return probe.expect === 'blocked' ? !hit : hit;
    });
    if (wrong.length > 0) {
      for (const probe of wrong) {
        console.error(
          `${probe.expect === 'blocked' ? 'NOT BLOCKED' : 'WRONGLY BLOCKED'}: ${probe.why}\n  ${probe.file} imports '${probe.specifier}'`,
        );
      }
      console.error(`\n${wrong.length} of ${probes.length} probes failed.`);
      return 1;
    }
    const blocked = probes.filter((probe) => probe.expect === 'blocked');
    console.log(
      `Boundary rule OK: ${blocked.length} violating imports blocked at every depth, ${probes.length - blocked.length} allowed ones clean.`,
    );
    return 0;
  } finally {
    cleanUp();
  }
}

process.exitCode = main();
