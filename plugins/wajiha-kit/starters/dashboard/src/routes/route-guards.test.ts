import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Every page under the signed-in shell must have a permission guard, except
 * the home page, and PERMISSIONS.md must list each page route. Adding a page
 * without a guard, or without a row in the table, fails here.
 */

const DASHBOARD = join(__dirname, '_dashboard');
const NO_GUARD_NEEDED = new Set(['index.tsx', 'route.tsx']);

function pageRoutes(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      pageRoutes(full, found);
    } else if (
      name.endsWith('.tsx') &&
      !name.endsWith('.test.tsx') &&
      !(dir === DASHBOARD && NO_GUARD_NEEDED.has(name))
    ) {
      found.push(full);
    }
  }
  return found;
}

const routes = pageRoutes(DASHBOARD).map((full) => ({
  file: relative(DASHBOARD, full).split(sep).join('/'),
  text: readFileSync(full, 'utf-8'),
}));

const doc = readFileSync(join(__dirname, '../../PERMISSIONS.md'), 'utf-8');

describe('route guards', () => {
  it('finds the page routes', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)('$file calls requirePermission', ({ text }) => {
    expect(text).toMatch(/requirePermission\(PERMS\.[a-zA-Z]+\.[a-zA-Z]+\)/u);
  });

  it.each(routes)('$file is listed in PERMISSIONS.md', ({ file }) => {
    const path = `/${file
      .replace(/\.tsx$/u, '')
      .replace(/\/index$/u, '')
      .replace(/^index$/u, '')}`.replaceAll(/\/\$(\w+)/gu, '/$$$1');
    expect(doc).toContain(`\`${path}\``);
  });
});
