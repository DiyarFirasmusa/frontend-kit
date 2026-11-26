import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LANGUAGES } from '@/lib/i18n/languages';
import {
  applyThemeToDocument,
  DEFAULT_DENSITY,
  DEFAULT_MODE,
  DEFAULT_PRESET,
  DENSITY_KEY,
  MODE_KEY,
  PRESET_KEY,
  resolveTheme,
} from './theme';

const initScript = readFileSync(
  join(__dirname, '../../public/theme-init.js'),
  'utf-8',
);

describe('resolveTheme', () => {
  it('maps system to the OS preference and passes explicit modes through', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('applyThemeToDocument', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.remove();
    });
    document.documentElement.style.removeProperty('--background');
  });

  it('points every theme-color meta at the chosen theme background', () => {
    for (const media of ['light', 'dark']) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = 'white';
      meta.media = `(prefers-color-scheme: ${media})`;
      document.head.append(meta);
    }
    // jsdom loads no stylesheet; stand in for the preset's --background.
    document.documentElement.style.setProperty('--background', 'black');

    applyThemeToDocument('dark', DEFAULT_PRESET, DEFAULT_DENSITY);

    const contents = [
      ...document.head.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
      ),
    ].map((meta) => meta.content);
    expect(contents).toEqual(['black', 'black']);
    expect(document.documentElement).toHaveClass('dark');
  });
});

describe('public/theme-init.js (runs before first paint)', () => {
  it('reads the same storage keys as the provider', () => {
    expect(initScript).toContain(`'${MODE_KEY}'`);
    expect(initScript).toContain(`'${PRESET_KEY}'`);
    expect(initScript).toContain(`'${DENSITY_KEY}'`);
  });

  it('uses the same defaults as the provider', () => {
    expect(DEFAULT_MODE).toBe('system');
    expect(initScript).toContain(`'${DEFAULT_PRESET}'`);
    expect(initScript).toContain(`'${DEFAULT_DENSITY}'`);
  });

  it('knows every right-to-left language from the language config', () => {
    const rtlLine = /var RTL = \[([^\]]*)\]/u.exec(initScript)?.[1] ?? '';
    const listed = [...rtlLine.matchAll(/'([a-z]+)'/gu)].map((m) => m[1]);
    for (const [code, config] of Object.entries(LANGUAGES)) {
      if (config.dir === 'rtl') {
        expect(listed, `${code} missing in theme-init.js`).toContain(code);
      }
    }
  });

  it('sets class, preset, density, lang and dir', () => {
    for (const piece of [
      "classList.toggle('dark'",
      'dataset.preset',
      'dataset.density',
      "'lang'",
      "'dir'",
    ]) {
      expect(initScript).toContain(piece);
    }
  });
});
