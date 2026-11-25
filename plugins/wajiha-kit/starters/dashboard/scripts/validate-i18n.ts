/**
 * Fails when a language is missing keys another language has, in the global
 * bundles (src/locales) and in every feature bundle (a locales folder under src).
 * Run with `npm run i18n:validate`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = new URL('../src', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/u,
  '$1',
);

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, found);
    } else if (name.endsWith('.json') && dir.endsWith('locales')) {
      found.push(full);
    }
  }
  return found;
}

/** Languages have different plural forms (Arabic has six), so `_one`/`_few`/... collapse to one key. */
const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/u;

function keysOf(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return [prefix.replace(PLURAL_SUFFIX, '')];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    keysOf(child, prefix ? `${prefix}.${key}` : key),
  );
}

const byFolder = new Map<string, Map<string, Set<string>>>();
for (const file of walk(SRC)) {
  const folder = join(file, '..');
  const lang = file.slice(folder.length + 1).replace(/\.json$/u, '');
  const bundle = JSON.parse(readFileSync(file, 'utf-8')) as unknown;
  const langs = byFolder.get(folder) ?? new Map<string, Set<string>>();
  langs.set(lang, new Set(keysOf(bundle)));
  byFolder.set(folder, langs);
}

let problems = 0;
for (const [folder, langs] of byFolder) {
  const union = new Set([...langs.values()].flatMap((keys) => [...keys]));
  for (const [lang, keys] of langs) {
    const missing = [...union].filter((key) => !keys.has(key));
    if (missing.length > 0) {
      problems += missing.length;
      console.error(
        `${relative(SRC, folder)}/${lang}.json is missing ${missing.length} key(s):\n  ${missing.slice(0, 10).join('\n  ')}`,
      );
    }
  }
}

if (problems > 0) {
  process.exit(1);
}
console.log(`i18n ok: ${byFolder.size} locale folders have matching keys`);
