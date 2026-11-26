import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/shared/lib/i18n/languages';
import { SITE, siteName } from './site.config';

const tokens = readFileSync(join(process.cwd(), 'src/shared/style/tokens.css'), 'utf8');

/** `--name: light-dark(#aaa, #bbb);` gives ['#aaa', '#bbb']. */
function pair(name: string): [string, string] {
  const match = new RegExp(
    String.raw`--${name}:\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)`,
    'i',
  ).exec(tokens);
  expect(match, `--${name} is a light-dark(#hex, #hex) in tokens.css`).not.toBeNull();
  return [match?.[1] ?? '', match?.[2] ?? ''];
}

describe('SITE', () => {
  it('has a name in every language', () => {
    for (const locale of LOCALES) {
      expect(siteName(locale).trim()).not.toBe('');
    }
  });

  it('themeColor is the palette: --primary in light, --bg in dark (no third copy that can drift)', () => {
    expect(SITE.themeColor.light).toBe(pair('primary')[0]);
    expect(SITE.themeColor.dark).toBe(pair('bg')[1]);
  });
});

describe('tokens.css', () => {
  it('has one palette: no dark-value block repeated for data-theme and for the system setting', () => {
    expect(tokens).not.toContain('prefers-color-scheme');
    expect(tokens.match(/--bg:/g)).toHaveLength(1);
  });
});
