import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A literal `t('some.key')` in production code must exist in the English
 * bundles (the global one or a feature's). A typo would otherwise render the
 * raw key on screen and pass every other check, because the key is just text.
 * Keys built at run time (template strings, variables) are not checked.
 */

const SRC = join(__dirname, '..');
const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/u;
// `t('a.b')` or `t("a.b", ...)`, not `.t(` of another object or `split(`.
const T_CALL = /(?<![\w.])t\(\s*(['"])([\w.-]+)\1/gu;

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, found);
    } else {
      found.push(full);
    }
  }
  return found;
}

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix, prefix.replace(PLURAL_SUFFIX, '')];
}

const files = walk(SRC);

const known = new Set(
  files
    .filter(
      (file) => file.endsWith(`${sep}en.json`) && file.includes('locales'),
    )
    .flatMap((file) => {
      const bundle: unknown = JSON.parse(readFileSync(file, 'utf-8'));
      return flatten(bundle);
    }),
);

const isProduction = (file: string) =>
  /\.tsx?$/u.test(file) &&
  !/\.(test|fixtures)\.tsx?$/u.test(file) &&
  !file.includes(`${sep}test${sep}`) &&
  !file.includes(`${sep}mocks${sep}`);

const used = files
  .filter((file) => isProduction(file))
  .flatMap((file) =>
    [...readFileSync(file, 'utf-8').matchAll(T_CALL)].map((match) => ({
      file: relative(SRC, file).split(sep).join('/'),
      key: match[2] ?? '',
    })),
  );

describe('translation keys', () => {
  it('finds the keys it checks', () => {
    expect(known.size).toBeGreaterThan(100);
    expect(used.length).toBeGreaterThan(100);
  });

  it('every literal t() key exists in the English bundles', () => {
    const missing = used.filter(({ key }) => !known.has(key));
    expect(missing).toEqual([]);
  });
});
