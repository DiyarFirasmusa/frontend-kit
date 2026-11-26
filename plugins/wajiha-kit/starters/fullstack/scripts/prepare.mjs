import { spawnSync } from 'node:child_process';
// Installs the git hooks, but never fails the install: a copied folder, a Docker build
// and CI without a .git folder have nothing to hook into.
import { existsSync } from 'node:fs';

if (process.env.CI || process.env.HUSKY === '0' || !existsSync('.git')) {
  console.log('prepare: no git repository here (or CI), skipping husky');
  process.exit(0);
}
const result = spawnSync('npx --no-install husky', { stdio: 'inherit', shell: true });
if (result.status !== 0) {
  console.warn('prepare: husky did not install, continuing without git hooks');
}
