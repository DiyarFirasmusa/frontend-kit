import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A comment or doc that says "(data-tables.md)" must point at a file that
 * exists: the rules in `.claude/rules/` are what Claude is told to follow, so
 * a dangling name is a rule nobody can read.
 */

const ROOT = join(__dirname, '..', '..');
const SKIP = new Set(['node_modules', 'dist', 'dev-dist', 'coverage']);
const MD_NAME = /\b([a-z][a-z0-9-]*(?:\.[a-z0-9-]+)*\.md)\b/gu;

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name === 'test-results') {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, found);
    } else {
      found.push(full);
    }
  }
  return found;
}

const files = [
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, '.claude')),
  ...readdirSync(ROOT).map((name) => join(ROOT, name)),
].filter((full) => statSync(full).isFile());

const documents = new Set(
  files
    .filter((full) => full.endsWith('.md'))
    .map((full) => full.split(sep).pop() ?? ''),
);

const mentions = files
  .filter((full) => /\.(ts|tsx|md)$/u.test(full))
  .flatMap((full) => {
    const text = readFileSync(full, 'utf-8');
    return [...text.matchAll(MD_NAME)].map((match) => ({
      file: relative(ROOT, full).split(sep).join('/'),
      name: match[1] ?? '',
    }));
  })
  // This file's own examples are not references.
  .filter(({ file }) => file !== 'src/style/doc-references.test.ts');

describe('doc references', () => {
  it('finds the documents it checks against', () => {
    expect(existsSync(join(ROOT, '.claude', 'rules'))).toBe(true);
    expect(documents.has('CLAUDE.md')).toBe(true);
    expect(mentions.length).toBeGreaterThan(5);
  });

  it.each(mentions)('$file points at $name, which exists', ({ name }) => {
    expect(documents.has(name)).toBe(true);
  });
});
