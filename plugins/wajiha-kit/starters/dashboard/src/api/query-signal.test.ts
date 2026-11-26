import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Every `queryFn` forwards the query's abort `signal` (api-layer-mocks.md), so
 * leaving a page or changing a filter cancels the request. The one exception
 * batches several callers into a single request, which one query must not abort.
 */

const SRC = join(__dirname, '..');
const BATCHED = new Set(['hooks/lookups/use-directory-entry.ts']);

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, found);
    } else if (/\.tsx?$/u.test(name) && !/\.test\.tsx?$/u.test(name)) {
      found.push(full);
    }
  }
  return found;
}

const queryFns = walk(SRC).flatMap((full) => {
  const path = relative(SRC, full).split(sep).join('/');
  const text = readFileSync(full, 'utf-8');
  return [...text.matchAll(/queryFn:/gu)].map((match) => ({
    path,
    // The function head: enough to hold `({ signal }) =>` or `fetchX(..., { signal })`.
    snippet: text.slice(match.index, match.index + 260),
  }));
});

describe('query abort signal', () => {
  it('finds the query functions it checks', () => {
    expect(queryFns.length).toBeGreaterThan(10);
  });

  it.each(queryFns.filter(({ path }) => !BATCHED.has(path)))(
    'a queryFn in $path forwards the signal',
    ({ snippet }) => {
      expect(snippet).toMatch(/signal/u);
    },
  );
});
