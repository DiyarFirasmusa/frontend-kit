// `npm run routes` is what an agent runs after adding a route file, so it must exit and must write exactly what
// the build writes. On the real project that means: it finishes and leaves the committed routeTree.gen.ts as it
// is, which also proves that file is not stale.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('npm run routes (scripts/generate-routes.mjs)', () => {
  it('exits by itself and leaves src/routeTree.gen.ts unchanged: the generated file is up to date', () => {
    const file = join(ROOT, 'src', 'routeTree.gen.ts');
    const before = readFileSync(file, 'utf8');
    const result = spawnSync(process.execPath, [join(ROOT, 'scripts', 'generate-routes.mjs')], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(`${result.stdout}${result.stderr}`).toContain('up to date');
    expect(result.status).toBe(0);
    expect(readFileSync(file, 'utf8')).toBe(before);
  }, 90_000);
});
