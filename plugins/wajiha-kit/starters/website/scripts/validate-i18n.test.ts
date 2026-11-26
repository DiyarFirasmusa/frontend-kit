// Runs the real validator on a small throwaway project, so the failures it promises are proven, not assumed.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'scripts', 'validate-i18n.ts');
const GOOD_RESOURCES = "export const resources = import.meta.glob('/src/**/locales/*.json');\n";
const typesFor = (...aliases: string[]): string =>
  aliases.map((alias) => `import type x from '${alias}';`).join('\n');

type Files = Record<string, string>;
const roots: string[] = [];

function project(extra: Files = {}, overrides: Files = {}): string {
  const files: Files = {
    'src/shared/lib/i18n/resources.ts': GOOD_RESOURCES,
    'src/shared/lib/i18n/i18next.d.ts': typesFor(
      '@/shared/locales/ar.json',
      '@/features/a/locales/ar.json',
    ),
    'src/shared/locales/ar.json': JSON.stringify({ nav: { home: 'الرئيسية' } }),
    'src/shared/locales/en.json': JSON.stringify({ nav: { home: 'Home' } }),
    'src/features/a/locales/ar.json': JSON.stringify({ page: { title: 'عنوان' } }),
    'src/features/a/locales/en.json': JSON.stringify({ page: { title: 'Title' } }),
    'src/features/a/index.ts': "export const k = ['nav.home', 'page.title'];\n",
    ...extra,
    ...overrides,
  };
  const root = mkdtempSync(join(tmpdir(), 'i18n-validate-'));
  roots.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

function run(root: string): { status: number | null; output: string } {
  const result = spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe('validate-i18n', () => {
  it('passes a consistent project', () => {
    const { status, output } = run(project());
    expect(output).toContain('i18n:validate ok');
    expect(status).toBe(0);
  });

  it('fails when a bundle is not in the typed-key file (a page added without registering its keys)', () => {
    const root = project({
      'src/features/b/locales/ar.json': JSON.stringify({ team: { title: 'ا' } }),
      'src/features/b/locales/en.json': JSON.stringify({ team: { title: 'a' } }),
    });
    const { status, output } = run(root);
    expect(status).toBe(1);
    expect(output).toContain('does not list src/features/b/locales/ar.json');
  });

  it('fails when resources.ts stops loading bundles by the glob', () => {
    const { status, output } = run(
      project({}, { 'src/shared/lib/i18n/resources.ts': 'export const resources = {};\n' }),
    );
    expect(status).toBe(1);
    expect(output).toContain('must load bundles with import.meta.glob');
  });

  it('fails when two bundles share a group name, even with different keys', () => {
    const { status, output } = run(
      project({
        'src/features/b/locales/ar.json': JSON.stringify({ page: { other: 'ا' } }),
        'src/features/b/locales/en.json': JSON.stringify({ page: { other: 'a' } }),
        'src/shared/lib/i18n/i18next.d.ts': typesFor(
          '@/shared/locales/ar.json',
          '@/features/a/locales/ar.json',
          '@/features/b/locales/ar.json',
        ),
      }),
    );
    expect(status).toBe(1);
    expect(output).toContain('group "page" is in two bundles');
  });

  it('fails on a language file that is not in LOCALES instead of ignoring it', () => {
    const { status, output } = run(
      project({ 'src/features/a/locales/zz.json': JSON.stringify({ page: { title: 'z' } }) }),
    );
    expect(status).toBe(1);
    expect(output).toContain('"zz" is not in LOCALES');
  });

  it('fails when a folder lacks a language, or a key is missing in one', () => {
    const lacking = run(
      project({}, { 'src/features/a/locales/en.json': JSON.stringify({ page: {} }) }),
    );
    expect(lacking.status).toBe(1);
    expect(lacking.output).toContain('"page.title" is in ar.json but missing from en.json');
  });
});
