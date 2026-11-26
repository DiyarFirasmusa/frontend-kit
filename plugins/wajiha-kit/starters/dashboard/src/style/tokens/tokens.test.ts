import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DENSITY, TYPE_RAMP, TYPE_RAMP_ARABIC } from './foundation';
import {
  allColourTokenNames,
  generatePreset,
  generateTheme,
  modeValues,
  rampVar,
} from './generate-css';
import { DEFAULT_PRESET_ID, PRESETS } from './presets';
import { PRESET_TOKEN_NAMES, type PresetTokenName } from './types';

const read = (name: string): string =>
  readFileSync(join(__dirname, '..', name), 'utf-8').replaceAll('\r\n', '\n');

function namesOf(index: number): string[] {
  const preset = PRESETS[index];
  if (!preset) {
    throw new Error('missing preset');
  }
  return Object.keys(modeValues(preset, 'light')).toSorted();
}

describe('design tokens: generated files', () => {
  it('keeps src/style/theme.css in sync with tokens (run `npm run tokens`)', () => {
    expect(read('theme.css')).toBe(generateTheme());
  });

  it('keeps src/style/preset.css in sync with tokens (run `npm run tokens`)', () => {
    expect(read('preset.css')).toBe(generatePreset());
  });
});

describe('design tokens: presets', () => {
  it('has a default preset that exists', () => {
    expect(PRESETS.map((p) => p.id)).toContain(DEFAULT_PRESET_ID);
  });

  it.each(PRESETS)('defines every colour in both modes ($id)', (preset) => {
    for (const mode of ['light', 'dark'] as const) {
      for (const name of PRESET_TOKEN_NAMES) {
        const value = preset[mode][name];
        expect(value, `${preset.id} ${mode} --${name}`).toBeTruthy();
        expect(value).toMatch(/^(#[0-9a-f]{6}|rgb\([\d. /]+\))$/iu);
      }
    }
  });

  it.each(PRESETS)(
    'gives light and dark different surfaces ($id)',
    (preset) => {
      expect(preset.light.background).not.toBe(preset.dark.background);
      expect(preset.light['text-primary']).not.toBe(
        preset.dark['text-primary'],
      );
    },
  );

  it('keeps one role-based colour vocabulary of about 90 names', () => {
    expect(allColourTokenNames().length).toBeGreaterThanOrEqual(85);
  });

  it('gives every preset the same set of resolved names', () => {
    for (let i = 1; i < PRESETS.length; i += 1) {
      expect(namesOf(i)).toEqual(namesOf(0));
    }
  });

  it('lets every preset own its brand accent (bg-brand, text-brand-text, bg-brand-tint)', () => {
    const theme = read('theme.css');
    const brand: readonly PresetTokenName[] = [
      'brand',
      'brand-text',
      'brand-tint',
    ];
    for (const name of brand) {
      expect(theme).toContain(`--color-${name}: var(--${name});`);
      for (const preset of PRESETS) {
        expect(preset.light[name]).not.toBe(preset.dark[name]);
      }
    }
    expect(read('preset.css')).not.toMatch(/--brand: var\(/u);
  });

  it('scopes the default preset to :root and every preset to data-preset', () => {
    const css = read('preset.css');
    for (const preset of PRESETS) {
      expect(css).toContain(`:root[data-preset='${preset.id}']`);
      expect(css).toContain(`:root[data-preset='${preset.id}'].dark`);
    }
  });
});

describe('design tokens: foundation', () => {
  const theme = read('theme.css');

  it.each(Object.keys(TYPE_RAMP))('defines type utility %s', (name) => {
    expect(theme).toContain(`@utility ${name} {`);
  });

  it.each(Object.entries(TYPE_RAMP))(
    'exposes %s as a font shorthand variable for component CSS',
    (name, style) => {
      const variable = `--${rampVar(name)}`;
      expect(theme).toContain(
        `${variable}: ${style.weight} ${style.size}px / ${style.line}px var(--font-${style.family});`,
      );
      expect(theme).toContain(`@utility ${name} {\n  font: var(${variable});`);
    },
  );

  it.each([
    'radius-control',
    'radius-modal',
    'radius-pill',
    'spacing-field',
    'spacing-inline',
    'spacing-row',
    'spacing-card',
    'spacing-page',
    'shadow-small',
    'shadow-large',
    'shadow-primary',
    'ease-standard',
    'duration-fast',
    'duration-base',
    'control-h',
    'field-h',
  ])('defines geometry and motion token --%s', (name) => {
    expect(theme).toContain(`--${name}:`);
  });

  it('declares color-scheme for both modes so native controls follow the theme', () => {
    expect(theme).toMatch(/:root \{[^}]*color-scheme: light/u);
    expect(theme).toMatch(/:root\.dark \{\s*color-scheme: dark/u);
  });

  it('offers a compact density that shrinks the controls', () => {
    expect(theme).toContain(":root[data-density='compact']");
  });

  it('keeps Arabic and Latin faces in the font stacks', () => {
    expect(theme).toMatch(/--font-sans:[^;]*IBM Plex Sans Arabic/u);
    expect(theme).toMatch(/--font-heading:[^;]*Cairo Variable/u);
  });

  it('only grows the type in Arabic, never shrinks it', () => {
    for (const [name, arabic] of Object.entries(TYPE_RAMP_ARABIC)) {
      const base = TYPE_RAMP[name];
      expect(base, name).toBeDefined();
      expect(arabic.size, name).toBeGreaterThanOrEqual(base?.size ?? 0);
      expect(arabic.line, name).toBeGreaterThanOrEqual(base?.line ?? 0);
    }
    expect(theme).toContain(':root:lang(ar)');
  });

  it('has one table row height per density, as a token', () => {
    expect(DENSITY.comfortable['row-h']).toBe('62px');
    expect(DENSITY.compact['row-h']).toBe('52px');
    expect(theme).toContain('--row-h: 62px');
  });
});
