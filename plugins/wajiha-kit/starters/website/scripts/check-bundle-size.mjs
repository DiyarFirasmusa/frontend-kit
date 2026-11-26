// Size budget for the pages, checked against the production build (run "npm run build" first).
// It starts the built server on a free port, reads the scripts and styles that /ar, /ar/news and /ar/contact
// load, adds up their gzip sizes and fails when
//   - a page is over its budget (BUDGETS below), or
//   - the form libraries (react-hook-form, zod) reached a page that has no form: they belong to /contact only.
// Run: npm run check:bundle. When you add a real feature and the budget is hit on purpose, raise the number
// in the same commit and say why.
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/**
 * Largest allowed gzip size in bytes: all JS and CSS a page loads (total) and the entry chunk alone.
 * Measured on the starter (home 151,006 B total with an entry of 94,318 B; news 150,662 B; contact 188,352 B,
 * which adds the form libraries). The entry has about 4% headroom: each added language costs 0.3 to 1.3 KB of it
 * (all languages are bundled into the entry, see "Performance" in STRUCTURE.md).
 */
const BUDGETS = {
  '/ar': { total: 169_000, entry: 98_000 },
  '/ar/news': { total: 169_000, entry: 98_000 },
  '/ar/contact': { total: 208_000, entry: 98_000 },
};

/** Pages that have no form: the form libraries must not be in anything they load. */
const NO_FORM_PAGES = new Set(['/ar', '/ar/news']);
/**
 * Text that only the form libraries contain (the string constants of react-hook-form, the names of zod's
 * error classes). Found in a file a form-less page loads = the contact form leaked into every page.
 */
const FORM_MARKERS = ['onTouched', 'ZodError'];

const OUTPUT = '.output';
if (!existsSync(join(OUTPUT, 'server', 'index.mjs'))) {
  console.error('check:bundle: no build found. Run "npm run build" first.');
  process.exit(1);
}

async function freePort() {
  const probe = createServer();
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', () => resolve(undefined)));
  const address = probe.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  await new Promise((resolve) => probe.close(() => resolve(undefined)));
  return port;
}

const port = await freePort();
const server = spawn(process.execPath, [join(OUTPUT, 'server', 'index.mjs')], {
  stdio: 'ignore',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    // A site built with indexing on refuses to start without a webhook; this one is never called.
    CONTACT_WEBHOOK_URL: process.env.CONTACT_WEBHOOK_URL ?? 'http://127.0.0.1:9/unused',
  },
});
const stop = () => {
  if (server.exitCode === null) {
    server.kill();
  }
};
process.on('exit', stop);

async function fetchHtml(path) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { redirect: 'manual' });
  if (response.status !== 200) {
    throw new Error(`${path} answered ${response.status}`);
  }
  return response.text();
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`the built server stopped (exit code ${server.exitCode})`);
    }
    try {
      return await fetchHtml('/ar');
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('the built server did not answer within 30 s');
}

/** Every script, preload, stylesheet and import() the HTML points at, as /assets/... paths. */
function assetsOf(html) {
  const found = new Set();
  const patterns = [
    /<script[^>]+src="([^"]+)"/g,
    /<link[^>]+href="([^"]+\.(?:js|css))"/g,
    /import\("([^"]+\.js)"\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      if (match[1].startsWith('/assets/')) {
        found.add(match[1]);
      }
    }
  }
  return [...found];
}

const problems = [];
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

try {
  const first = await waitForServer();
  for (const [path, budget] of Object.entries(BUDGETS)) {
    const html = path === '/ar' ? first : await fetchHtml(path);
    let total = 0;
    let entry = 0;
    for (const url of assetsOf(html)) {
      const file = join(OUTPUT, 'public', url);
      if (!existsSync(file)) {
        problems.push(`${path}: ${url} is not in ${OUTPUT}/public`);
        continue;
      }
      const bytes = readFileSync(file);
      const size = gzipSync(bytes, { level: 9 }).length;
      total += size;
      if (process.env.CHECK_BUNDLE_VERBOSE === '1') {
        console.log(`  ${path} ${String(size).padStart(7)}  ${url}`);
      }
      if (url.endsWith('.js') && /\/index-[^/]+\.js$/.test(url)) {
        entry = Math.max(entry, size);
      }
      if (url.endsWith('.js') && NO_FORM_PAGES.has(path)) {
        const text = bytes.toString('utf8');
        for (const marker of FORM_MARKERS) {
          if (text.includes(marker)) {
            problems.push(
              `${path}: ${url} contains "${marker}" (form library code in a page without a form)`,
            );
          }
        }
      }
    }
    console.log(
      `check:bundle ${path.padEnd(12)} total ${total} B = ${kb(total)} (budget ${budget.total}), entry ${entry} B = ${kb(entry)} (budget ${budget.entry})`,
    );
    if (total > budget.total) {
      problems.push(`${path}: ${kb(total)} gzip is over the budget of ${kb(budget.total)}`);
    }
    if (entry === 0) {
      problems.push(`${path}: the entry chunk (index-*.js) was not found, the check cannot run`);
    } else if (entry > budget.entry) {
      problems.push(`${path}: entry ${kb(entry)} gzip is over the budget of ${kb(budget.entry)}`);
    }
  }
} catch (error) {
  problems.push(error instanceof Error ? error.message : String(error));
} finally {
  stop();
}

if (problems.length > 0) {
  for (const problem of new Set(problems)) {
    console.error(`error ${problem}`);
  }
  console.error(`\ncheck:bundle failed with ${new Set(problems).size} problem(s)`);
  process.exit(1);
}
console.log('check:bundle ok: pages are within budget and the form libraries stay on /contact');
