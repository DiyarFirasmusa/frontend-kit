// Proof that the PUBLIC pages are small and carry no admin code, checked against the production build.
// Run: npm run build:proof && npm run check:bundle  (build:proof is "vite build" plus hidden source maps,
// which it moves out of .output into .proof-maps, where this script reads them; a plain "npm run build" makes
// none). The deployable output must hold no source map at all: this script fails if one is there or is served.
// It starts the built server on a free port and loads EVERY public page of the sitemap in both languages
// plus the not-found page. For each script a page loads it fails when
//   - a module of src/features/admin or of the admin-only UI folders is inside it, unless it is on the
//     allow-list in scripts/bundle-sources.ts (read from the source map: a chunk name cannot hide it),
//   - an admin package (axios, TanStack Query, MSW) is inside it,
//   - an admin text marker is in it (a second net), or
//   - the page is over its gzip budget (BUDGETS below; a page without its own number gets the largest one).
// A build made with the mock API off (VITE_ADMIN_API_MOCK is not "true", the default) must also carry no
// MSW anywhere and no mock service worker file, and the server must answer 404 for it.
// The admin is loaded lazily on /{lang}/admin only (STRUCTURE.md); this script is what proves it.
// When you add a real feature to the public site and the budget is hit on purpose, raise the number in
// the same commit and say why.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { loadEnv } from 'vite';
import { forbiddenSources, pagePath, sitemapPaths } from './bundle-sources.ts';
import { findMaps, PROOF_MAPS_DIR } from './proof-maps.ts';

/**
 * Largest allowed gzip size in bytes per language-free page: all JS and CSS a page loads (total) and the
 * entry chunk alone. Measured on the starter (home 167,031 B total with an entry of 95,901 B; news
 * 166,693 B; contact 206,287 B) plus about 4% headroom. Before the admin code was moved out of the public
 * entry the home page was 254,361 B.
 */
const BUDGETS = {
  '/': { total: 175_000, entry: 100_000 },
  '/news': { total: 175_000, entry: 100_000 },
  '/contact': { total: 216_000, entry: 100_000 },
};
const DEFAULT_BUDGET = {
  total: Math.max(...Object.values(BUDGETS).map((budget) => budget.total)),
  entry: Math.max(...Object.values(BUDGETS).map((budget) => budget.entry)),
};
/** A page that answers 404 still ships HTML and scripts to the visitor. */
const NOT_FOUND_PATHS = ['/ar/not-a-page', '/en/not-a-page'];

/** Text that only admin code contains. Found in a public file = the admin leaked into the public pages. */
const ADMIN_MARKERS = [
  'AxiosError',
  'ERR_CANCELED',
  'admin-auth',
  'admin-permissions',
  'session-expired',
  'mock-token',
];

/** Chunks the bundler generates itself (preload helper, runtime): no source file, no source map. */
const VIRTUAL_CHUNK = /\/(?:preload-helper|rolldown-runtime)-[^/]+\.js$/;

const OUTPUT = '.output';
if (!existsSync(join(OUTPUT, 'server', 'index.mjs'))) {
  console.error('check:bundle: no build found. Run "npm run build:proof" first.');
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

async function fetchText(path, expected = 200) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { redirect: 'manual' });
  if (response.status !== expected) {
    throw new Error(`${path} answered ${response.status}, expected ${expected}`);
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
      return await fetchText('/ar');
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
const verbose = process.env.CHECK_BUNDLE_VERBOSE === '1';

/** What is true of one built file, worked out once however many pages load it. */
const fileCache = new Map();
function inspect(url) {
  const cached = fileCache.get(url);
  if (cached) {
    return cached;
  }
  const file = join(OUTPUT, 'public', url);
  const result = { size: 0, entry: false, issues: [] };
  fileCache.set(url, result);
  if (!existsSync(file)) {
    result.issues.push(`${url} is not in ${OUTPUT}/public`);
    return result;
  }
  const bytes = readFileSync(file);
  result.size = gzipSync(bytes, { level: 9 }).length;
  if (!url.endsWith('.js')) {
    return result;
  }
  result.entry = /\/index-[^/]+\.js$/.test(url);
  const text = bytes.toString('utf8');
  for (const marker of ADMIN_MARKERS) {
    if (text.includes(marker)) {
      result.issues.push(`${url} contains "${marker}" (admin code in a public file)`);
    }
  }
  const mapFile = join(PROOF_MAPS_DIR, 'public', `${url}.map`);
  // Generated chunks are not read from a source file, so they have no map (and no source).
  if (!existsSync(mapFile) && VIRTUAL_CHUNK.test(url)) {
    return result;
  }
  if (!existsSync(mapFile)) {
    result.issues.push(
      `${url} has no source map: the proof needs "npm run build:proof" (hidden source maps)`,
    );
    return result;
  }
  const { sources = [] } = JSON.parse(readFileSync(mapFile, 'utf8'));
  for (const source of forbiddenSources(sources)) {
    result.issues.push(`${url} contains ${source}: admin code is in a public page`);
  }
  return result;
}

/** A build with the mock off ships no mock service worker file and no MSW code (STRUCTURE.md, api-layer.md). */
async function checkMockOff() {
  const mockOn = loadEnv('production', process.cwd(), '')['VITE_ADMIN_API_MOCK'] === 'true';
  if (mockOn) {
    console.log('check:bundle mock API is ON in this build: the mock service worker is expected');
    return;
  }
  const publicDir = join(OUTPUT, 'public');
  const worker = readdirSync(publicDir).filter((name) => name.startsWith('mockServiceWorker.js'));
  if (worker.length > 0) {
    problems.push(`the mock is off but the output still contains ${worker.join(', ')}`);
  }
  const response = await fetch(`http://127.0.0.1:${port}/mockServiceWorker.js`, {
    redirect: 'manual',
  });
  if (response.status !== 404) {
    problems.push(`the mock is off but /mockServiceWorker.js answers ${response.status}, not 404`);
  }
  const assets = join(PROOF_MAPS_DIR, 'public', 'assets');
  const maps = existsSync(assets)
    ? readdirSync(assets).filter((name) => name.endsWith('.js.map'))
    : [];
  let withMsw = 0;
  for (const name of maps) {
    const { sources = [] } = JSON.parse(readFileSync(join(assets, name), 'utf8'));
    if (sources.some((source) => /node_modules\/(?:msw|@mswjs)\//.test(source))) {
      withMsw += 1;
      problems.push(`the mock is off but assets/${name.replace(/\.map$/, '')} contains MSW`);
    }
  }
  console.log(
    `check:bundle mock API is OFF in this build: no worker file, /mockServiceWorker.js is 404, MSW in ${withMsw} of ${maps.length} chunks`,
  );
}

/** A source map holds the original source: none may be in the deployable output, and none may be served. */
async function checkNoMaps(html) {
  const inOutput = findMaps(OUTPUT);
  for (const name of inOutput.slice(0, 5)) {
    problems.push(
      `${OUTPUT}/${name} is a source map in the deployable output (build:proof must move it out)`,
    );
  }
  let probed = 0;
  for (const url of assetsOf(html).filter((asset) => asset.endsWith('.js'))) {
    const response = await fetch(`http://127.0.0.1:${port}${url}.map`, { redirect: 'manual' });
    probed += 1;
    if (response.status !== 404) {
      problems.push(`${url}.map is served (${response.status}), not 404`);
    }
  }
  console.log(
    `check:bundle source maps: ${inOutput.length} in ${OUTPUT}, ${probed} map URLs probed (all must answer 404)`,
  );
}

try {
  const first = await waitForServer();
  await checkNoMaps(first);
  await checkMockOff();
  const sitemap = await fetchText('/sitemap.xml');
  const pages = sitemapPaths(sitemap).map((path) => ({ path, status: 200 }));
  if (pages.length < 4) {
    throw new Error(
      `/sitemap.xml lists only ${pages.length} page(s): the check cannot cover the site`,
    );
  }
  for (const path of NOT_FOUND_PATHS) {
    pages.push({ path, status: 404 });
  }
  for (const { path, status } of pages) {
    const html = path === '/ar' ? first : await fetchText(path, status);
    const budget = BUDGETS[pagePath(path)] ?? DEFAULT_BUDGET;
    let total = 0;
    let entry = 0;
    for (const url of assetsOf(html)) {
      const info = inspect(url);
      total += info.size;
      if (info.entry) {
        entry = Math.max(entry, info.size);
      }
      for (const issue of info.issues) {
        problems.push(`${path}: ${issue}`);
      }
    }
    if (verbose || BUDGETS[pagePath(path)] !== undefined) {
      console.log(
        `check:bundle ${path.padEnd(22)} total ${total} B = ${kb(total)} (budget ${budget.total}), entry ${entry} B = ${kb(entry)} (budget ${budget.entry})`,
      );
    }
    if (total > budget.total) {
      problems.push(`${path}: ${kb(total)} gzip is over the budget of ${kb(budget.total)}`);
    }
    if (entry === 0) {
      problems.push(`${path}: the entry chunk (index-*.js) was not found, the check cannot run`);
    } else if (entry > budget.entry) {
      problems.push(`${path}: entry ${kb(entry)} gzip is over the budget of ${kb(budget.entry)}`);
    }
  }
  console.log(
    `check:bundle looked at ${pages.length} pages (sitemap in both languages + not-found) and ${fileCache.size} files`,
  );
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
console.log('check:bundle ok: public pages are within budget and carry no admin code');
