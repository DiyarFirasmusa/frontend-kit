// Proves the import boundaries in oxlint.config.ts still fire. It writes probe files into a temporary
// folder inside the project (.lint-probe, removed afterwards), lints them with a copy of the real config
// and checks that every forbidden import is reported and every allowed one is not.
// Run: npm run check:boundaries. A lint rule nobody tests can silently stop working (a relative import
// across site/admin once passed every check), so this is part of "npm run check".
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const PROBE = join(ROOT, '.lint-probe');
const OXLINT = join(ROOT, 'node_modules', 'oxlint', 'bin', 'oxlint');

// [file, import line, true = must be reported]
const CASES = [
  // The public site never imports the admin: alias and relative, at several depths, all import forms.
  ['src/features/site/home/a.ts', "import { x } from '@/features/admin/store/auth-store';", true],
  ['src/features/site/home/a.ts', "export * from '@/features/admin/api/client';", true],
  ['src/features/site/home/a.ts', "const m = () => import('@/features/admin/api/client');", true],
  [
    'src/features/site/home/a/b/c.ts',
    "import { x } from '../../../../admin/store/auth-store';",
    true,
  ],
  ['src/features/site/home/a/b/c.ts', "import { x } from '../../../admin';", true],
  [
    'src/features/site/home/a/b/c.ts',
    "import type { T } from '../../../../admin/types/api';",
    true,
  ],
  // The admin never imports the public site.
  [
    'src/features/admin/suppliers/a.ts',
    "import { x } from '@/features/site/config/nav.config';",
    true,
  ],
  ['src/features/admin/suppliers/a/b/c.ts', "import { x } from '../../../../site/home';", true],
  [
    'src/features/admin/suppliers/a/b/c/d.ts',
    "import { x } from '../../../../../site/home/use-home-page';",
    true,
  ],
  // Shared code never imports a feature or a route.
  ['src/components/ui/a.ts', "import { x } from '@/features/admin/api/client';", true],
  [
    'src/components/ui/deep/a.ts',
    "import { x } from '../../../features/admin/store/auth-store';",
    true,
  ],
  [
    'src/shared/lib/deep/a/b.ts',
    "import { x } from '../../../../features/site/config/nav.config';",
    true,
  ],
  ['src/shared/lib/a.ts', "import { x } from '../../routes/__root';", true],
  // The API layer never imports UI.
  ['src/features/admin/api/a.ts', "import { x } from '@/components/ui/button';", true],
  ['src/features/admin/api/a.ts', "import { x } from '../../../components/ui/button';", true],
  // axios only inside the admin API folder.
  ['src/features/admin/suppliers/a.ts', "import axios from 'axios';", true],
  ['src/features/site/home/a.ts', "const m = () => import('axios');", true],
  // Allowed imports must stay allowed (no false positives).
  ['src/features/admin/api/a.ts', "import axios from 'axios';", false],
  ['src/features/admin/suppliers/a.ts', "import { x } from '../api/client';", false],
  ['src/features/admin/suppliers/a/b.ts', "import { x } from '../../store/auth-store';", false],
  ['src/features/admin/suppliers/a.ts', "import { x } from '@/components/ui/button';", false],
  ['src/features/site/home/a.ts', "import { x } from '../components/page-header';", false],
  ['src/features/site/home/a.ts', "import { x } from '@/shared/lib/seo/seo';", false],
  ['src/components/ui/a.ts', "import { x } from '@/shared/utils/cn';", false],
  ['src/components/ui/a.ts', "import { x } from './button';", false],
  ['src/shared/lib/a.ts', "import { x } from '../utils/cn';", false],
];

function cleanup() {
  rmSync(PROBE, { recursive: true, force: true });
}

if (!existsSync(OXLINT)) {
  console.error('check:boundaries: oxlint is not installed (run npm ci)');
  process.exit(1);
}
cleanup();
let failures = 0;
try {
  mkdirSync(PROBE, { recursive: true });
  // The real config, so the probe tests what the project really uses. It sits one folder deeper than the
  // original, so "import from 'oxlint'" still resolves through the project's node_modules.
  cpSync(join(ROOT, 'oxlint.config.ts'), join(PROBE, 'oxlint.config.ts'));
  CASES.forEach(([file, line], index) => {
    // One folder per case, so each result is about one import and nothing else.
    const path = join(PROBE, `case-${index}`, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${line}\n`);
  });
  // Each case folder needs the config's relative "files" globs to match, so lint them one by one.
  CASES.forEach(([file, line, mustFail], index) => {
    const dir = join(PROBE, `case-${index}`);
    cpSync(join(PROBE, 'oxlint.config.ts'), join(dir, 'oxlint.config.ts'));
    const result = spawnSync(
      process.execPath,
      [OXLINT, '-c', 'oxlint.config.ts', '--no-ignore', '-f', 'json', file],
      { cwd: dir, encoding: 'utf8' },
    );
    let diagnostics = [];
    try {
      diagnostics = JSON.parse(result.stdout).diagnostics ?? [];
    } catch {
      console.error(`error ${file}: oxlint printed no JSON\n${result.stdout}${result.stderr}`);
      failures += 1;
      return;
    }
    const restricted = diagnostics.filter((d) => String(d.code).includes('no-restricted-imports'));
    if (mustFail && restricted.length === 0) {
      console.error(`error NOT blocked: ${file}  ${line}`);
      failures += 1;
    } else if (!mustFail && restricted.length > 0) {
      console.error(`error wrongly blocked: ${file}  ${line}`);
      failures += 1;
    }
  });
} finally {
  cleanup();
}

if (failures > 0) {
  console.error(`\ncheck:boundaries failed: ${failures} of ${CASES.length} probes behaved wrongly`);
  process.exit(1);
}
console.log(
  `check:boundaries ok: ${CASES.length} probe imports (forbidden ones blocked, allowed ones free)`,
);
