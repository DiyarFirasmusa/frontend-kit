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
  // Packages that belong to the admin: the public site never imports them (stack notes in CLAUDE.md).
  ['src/features/site/home/a.ts', "import { useQuery } from '@tanstack/react-query';", true],
  ['src/features/site/home/a.ts', "import { setupWorker } from 'msw/browser';", true],
  ['src/features/site/home/a.ts', "import { setupServer } from 'msw/node';", true],
  // Test helpers and the mock API are for tests only.
  ['src/features/site/home/a.ts', "import { x } from '@/test/render';", true],
  ['src/features/admin/suppliers/a.ts', "import { x } from '@/test/render';", true],
  [
    'src/features/admin/suppliers/a.ts',
    "import { handlers } from '@/features/admin/mocks/handlers';",
    true,
  ],
  ['src/features/admin/suppliers/a.ts', "import { db } from '../mocks/db';", true],
  ['src/features/admin/api/a.ts', "import { db } from '../mocks/db';", true],
  // Components, pages and hooks never call axios: only <x>.service.ts and the api folder do.
  [
    'src/features/admin/layout/a.tsx',
    "import { privateApi } from '@/features/admin/api/client';",
    true,
  ],
  ['src/features/admin/suppliers/a.ts', "import { privateApi } from '../api/client';", true],
  ['src/features/admin/settings/use-x.ts', "import { endpoints } from '../api/endpoints';", true],
  [
    'src/features/admin/suppliers/a/b/c.ts',
    "import { privateApi } from '../../../api/client';",
    true,
  ],
  // Features never import route files; shared UI never imports server code.
  ['src/features/admin/layout/a.tsx', "import { Route } from '@/routes/__root';", true],
  ['src/features/admin/layout/a.tsx', "import { Route } from '../../../routes/__root';", true],
  ['src/components/ui/a.ts', "import { x } from '@/shared/server/security-headers';", true],
  ['src/components/ui/deep/a.ts', "import { x } from '../../../shared/server/env.server';", true],
  // Route files, the router and the server entry never import the admin statically.
  ['src/routes/$locale/a.ts', "import { x } from '@/features/admin/store/auth-store';", true],
  ['src/routes/$locale/a.ts', "import { x } from '../../features/admin/store/auth-store';", true],
  ['src/router.tsx', "import { x } from '@/features/admin/api/client';", true],
  ['src/router.tsx', "import { x } from './features/admin/store/auth-store';", true],
  ['src/start.ts', "export * from '@/features/admin/store/auth-store';", true],
  // Allowed imports must stay allowed (no false positives).
  ['src/features/admin/api/a.ts', "import axios from 'axios';", false],
  [
    'src/features/admin/suppliers/suppliers.service.ts',
    "import { x } from '../api/client';",
    false,
  ],
  ['src/features/admin/suppliers/a/b.ts', "import { x } from '../../store/auth-store';", false],
  ['src/features/admin/suppliers/a.ts', "import { x } from '@/components/ui/button';", false],
  ['src/features/site/home/a.ts', "import { x } from '../components/page-header';", false],
  ['src/features/site/home/a.ts', "import { x } from '@/shared/lib/seo/seo';", false],
  ['src/components/ui/a.ts', "import { x } from '@/shared/utils/cn';", false],
  ['src/components/ui/a.ts', "import { x } from './button';", false],
  ['src/shared/lib/a.ts', "import { x } from '../utils/cn';", false],
  // The service layer calls the API clients; the api folder and the mocks use their own neighbours.
  [
    'src/features/admin/suppliers/suppliers.service.ts',
    "import { privateApi } from '@/features/admin/api/client';",
    false,
  ],
  [
    'src/features/admin/auth/login.service.ts',
    "import { endpoints } from '../api/endpoints';",
    false,
  ],
  ['src/features/admin/api/a.ts', "import { privateApi } from './client';", false],
  ['src/features/admin/mocks/a.ts', "import { endpoints } from '../api/endpoints';", false],
  ['src/features/admin/mocks/a.ts', "import { db } from './db';", false],
  // Admin code may use TanStack Query, query keys and the stores; shared code may use the clean helpers.
  ['src/features/admin/suppliers/a.ts', "import { useQuery } from '@tanstack/react-query';", false],
  ['src/features/admin/suppliers/a.ts', "import { qk } from '../api/query-keys';", false],
  [
    'src/features/site/home/a.ts',
    "import { createFileRoute } from '@tanstack/react-router';",
    false,
  ],
  [
    'src/features/site/contact/server/a.ts',
    "import { x } from '@/shared/server/env.server';",
    false,
  ],
  ['src/shared/server/a.ts', "import { x } from './env.server';", false],
  // Tests may use the mocks and the test helpers.
  [
    'src/features/admin/suppliers/a.test.tsx',
    "import { handlers } from '@/features/admin/mocks/handlers';",
    false,
  ],
  ['src/features/site/home/a.test.tsx', "import { x } from '@/test/render';", false],
  // Admin route files may import the admin (their split properties keep it out; check:bundle proves it).
  [
    'src/routes/$locale_/admin/a.ts',
    "import { x } from '@/features/admin/store/auth-store';",
    false,
  ],
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
