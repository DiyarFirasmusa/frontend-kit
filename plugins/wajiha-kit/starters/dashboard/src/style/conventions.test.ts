import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Style conventions the code must keep, checked by reading the source:
 *  1. Logical direction only (ms/me/ps/pe/start/end), so RTL and LTR both work.
 *  2. Colours come from tokens, never a hex or rgb literal in a component.
 *  3. \`primary\` is a fill: text uses text-primary-text, never text-primary.
 */

const SRC = join(__dirname, '..');

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, found);
    } else if (/\.(ts|tsx)$/u.test(name)) {
      found.push(full);
    }
  }
  return found;
}

const files = walk(SRC)
  .map((full) => ({
    path: relative(SRC, full).split(sep).join('/'),
    text: readFileSync(full, 'utf-8'),
  }))
  .filter(
    ({ path }) =>
      !path.endsWith('.test.ts') &&
      !path.endsWith('.test.tsx') &&
      !path.startsWith('test/') &&
      !path.startsWith('mocks/') &&
      path !== 'routeTree.gen.ts',
  );

/** Class names inside quoted strings of a source file (a cheap, good-enough scan). */
function classTokens(text: string): string[] {
  return [...text.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/gu)].flatMap(
    (m) => (m[2] ?? '').split(/\s+/u),
  );
}

const PHYSICAL =
  /^(?:[a-z-]+:)*-?(?:ml|mr|pl|pr|left|right|text-left|text-right|rounded-[lr]|rounded-[tb][lr]|border-[lr]|float-left|float-right)-/u;

/** Files that colour a mark from data (chart series), which no token can name. */
const DATA_COLOUR = new Set([
  'components/ui/chart.tsx',
  'components/ui/chart-legend.tsx',
  'components/ui/chart-tooltip.tsx',
]);

describe('style conventions', () => {
  it('uses logical direction utilities only', () => {
    const offenders = files.flatMap(({ path, text }) =>
      classTokens(text)
        .filter((token) => PHYSICAL.test(token) && !token.includes('${'))
        .map((token) => `${path}: ${token}`),
    );
    expect(offenders).toEqual([]);
  });

  it('keeps colour literals out of components', () => {
    const offenders = files
      .filter(
        ({ path }) => !path.startsWith('style/') && !DATA_COLOUR.has(path),
      )
      .flatMap(({ path, text }) =>
        [...text.matchAll(/#[0-9a-fA-F]{6}\b|rgba?\(/gu)].map(
          (m) => `${path}: ${m[0]}`,
        ),
      );
    expect(offenders).toEqual([]);
  });

  it('never uses text-primary (primary is a fill colour)', () => {
    const offenders = files
      .filter(({ path }) => path.endsWith('.tsx'))
      .flatMap(({ path, text }) =>
        classTokens(text)
          .filter((token) => /(?:^|:)text-primary$/u.test(token))
          .map((token) => `${path}: ${token}`),
      );
    expect(offenders).toEqual([]);
  });

  it('has no inline style attributes that set a colour', () => {
    const offenders = files
      .filter(({ path }) => !DATA_COLOUR.has(path))
      .flatMap(({ path, text }) =>
        [...text.matchAll(/style=\{\{[^}]*\b(?:color|background)\b/gu)].map(
          (m) => `${path}: ${m[0].slice(0, 40)}`,
        ),
      );
    expect(offenders).toEqual([]);
  });
});
