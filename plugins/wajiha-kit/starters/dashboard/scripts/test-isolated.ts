/**
 * Runs the test files that call vi.resetModules() with module isolation on
 * (see RESETS_MODULES in vitest.config.ts). Part of `npm run test`.
 */
import { spawnSync } from 'node:child_process';

const run = spawnSync(
  process.execPath,
  ['node_modules/vitest/vitest.mjs', 'run', ...process.argv.slice(2)],
  { stdio: 'inherit', env: { ...process.env, VITEST_ISOLATED: '1' } },
);

process.exitCode = run.status ?? 1;
