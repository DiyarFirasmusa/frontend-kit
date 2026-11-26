// Builds the site and serves the production build for Playwright. Cross-platform (no shell syntax).
// E2E_SKIP_BUILD=1 reuses the existing .output (only when you know it was built for this port and settings).
//
// The site is built as the real site (indexing on), and the real site refuses to start without a contact
// webhook. So this script also runs a tiny local webhook receiver on a free port: it answers 200, or 500
// when the message contains the marker below (the e2e failure-path test uses it).
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

/** Keep in step with WEBHOOK_FAIL_MARKER in e2e/fixtures/app.ts. */
const FAIL_MARKER = 'e2e-webhook-fail';

const receiver = createServer((request, response) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    response.writeHead(body.includes(FAIL_MARKER) ? 500 : 200).end();
  });
});
await new Promise((resolve) => receiver.listen(0, '127.0.0.1', () => resolve(undefined)));
const address = receiver.address();
const receiverPort = typeof address === 'object' && address !== null ? address.port : 0;

const port = process.env.E2E_PORT ?? '5191';
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: port,
  // Baked into the build: the origin the tests use, and "this is the real production site" so pages are indexable.
  VITE_SITE_URL: `http://localhost:${port}`,
  VITE_ALLOW_INDEXING: 'true',
  CSP_MODE: 'enforce',
  CONTACT_WEBHOOK_URL: `http://127.0.0.1:${receiverPort}/contact`,
  // The admin talks to the mock API inside the browser, so the tests need no backend.
  VITE_ADMIN_API_URL: '/api',
  VITE_ADMIN_API_MOCK: 'true',
  // The build refuses "mock API + indexing on" (a real site must not accept any login); here it is on purpose.
  ALLOW_MOCK_ON_REAL_SITE: '1',
};

if (process.env.E2E_SKIP_BUILD !== '1') {
  // The same build as "npm run build", through the Vite API so no shell or binary path is involved.
  Object.assign(process.env, env);
  const { createBuilder } = await import('vite');
  const builder = await createBuilder();
  await builder.buildApp();
  // The production build must hold no source map (they would be served): stop before serving if one does.
  const { findMaps, OUTPUT_DIR } = await import('./proof-maps.ts');
  const maps = findMaps(OUTPUT_DIR);
  if (maps.length > 0) {
    console.error(`e2e build: ${maps.length} source map file(s) in ${OUTPUT_DIR}, e.g. ${maps[0]}`);
    process.exit(1);
  }
}

const server = spawn(process.execPath, ['.output/server/index.mjs'], { stdio: 'inherit', env });
server.on('exit', (code) => {
  receiver.close();
  process.exit(code ?? 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
