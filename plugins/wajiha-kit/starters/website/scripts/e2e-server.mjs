// Builds the site and serves the production build for Playwright. Cross-platform (no shell syntax).
// E2E_SKIP_BUILD=1 reuses the existing .output (only when you know it was built for this port and settings).
import { spawn } from 'node:child_process';

const port = process.env.E2E_PORT ?? '5191';
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: port,
  // Baked into the build: the origin the tests use, and "this is the real production site" so pages are indexable.
  VITE_SITE_URL: `http://localhost:${port}`,
  VITE_ALLOW_INDEXING: 'true',
  CSP_MODE: 'enforce',
  CONTACT_WEBHOOK_URL: '',
};

if (process.env.E2E_SKIP_BUILD !== '1') {
  // The same build as "npm run build", through the Vite API so no shell or binary path is involved.
  Object.assign(process.env, env);
  const { createBuilder } = await import('vite');
  const builder = await createBuilder();
  await builder.buildApp();
}

const server = spawn(process.execPath, ['.output/server/index.mjs'], { stdio: 'inherit', env });
server.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
