import { describe, expect, it } from 'vitest';
import { blendOver, contrast, luminance, mixOklab } from './contrast';
import { modeValues } from './generate-css';
import { PRESETS } from './presets';
import { TAG_HUES, type Mode } from './types';

/**
 * WCAG AA gate for every preset in both modes: 4.5:1 for text on the surfaces
 * and tints the app puts text on, 3:1 for the focus ring. Adding a preset adds
 * its cases here without touching this file.
 *
 * Not covered on purpose: --text-inactive (disabled labels are exempt from
 * WCAG 1.4.3). Placeholders and secondary copy use --text-muted, which is
 * checked on every surface and on the filled field (`.control`) below.
 */

const SURFACES = [
  'background',
  'surface',
  'surface-dim',
  'surface-elevated',
  'popover',
  'hover-row',
  'sidebar',
] as const;

const TEXT = [
  'text-primary',
  'text-secondary',
  'text-muted',
  'primary-text',
  'brand-text',
  'success',
  'warning',
  'danger',
  'info',
] as const;

/** Tokens a placeholder may use: text-inactive is for disabled controls only. */
const PLACEHOLDER_TOKENS = ['text-muted'] as const;

const TINT_PAIRS = [
  ['primary-light', 'primary-text'],
  ['primary-light', 'text-primary'],
  ['brand-tint', 'brand-text'],
  ['brand-tint', 'text-primary'],
  ['brand-tint', 'text-secondary'],
  ['sidebar-accent', 'sidebar-accent-foreground'],
  ['sidebar-accent', 'text-primary'],
  ['sidebar-selected', 'sidebar-selected-foreground'],
] as const;

const FILL_PAIRS = [
  ['brand-panel-from', 'white'],
  ['brand-panel-to', 'white'],
  ['primary', 'primary-foreground'],
  ['primary-container', 'primary-foreground'],
  ['success', 'success-foreground'],
  ['warning', 'warning-foreground'],
  ['danger', 'danger-foreground'],
  ['info', 'info-foreground'],
] as const;

const cases = PRESETS.flatMap((preset) =>
  (['light', 'dark'] as const).map((mode: Mode) => ({
    label: `${preset.id} ${mode}`,
    values: modeValues(preset, mode),
  })),
);

function at(values: Readonly<Record<string, string>>, name: string): string {
  if (name === 'white') {
    return '#ffffff';
  }
  const value = values[name];
  if (!value) {
    throw new Error(`missing token --${name}`);
  }
  return value;
}

describe('design tokens: WCAG AA contrast, every preset', () => {
  it.each(cases)(
    'text tokens reach 4.5:1 on surfaces ($label)',
    ({ label, values }) => {
      for (const surface of SURFACES) {
        for (const text of TEXT) {
          expect(
            contrast(at(values, text), at(values, surface)),
            `${label}: --${text} on --${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it.each(cases)(
    'placeholder text reaches 4.5:1 on the filled field, in dialogs too ($label)',
    ({ label, values }) => {
      // `.control` fills with 4% of the text colour over the surface it sits on.
      for (const surface of ['surface', 'surface-elevated', 'popover']) {
        const field = mixOklab(
          at(values, 'text-primary'),
          4,
          at(values, surface),
        );
        for (const placeholder of PLACEHOLDER_TOKENS) {
          expect(
            contrast(at(values, placeholder), field),
            `${label}: --${placeholder} on a field over --${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it('mixes like CSS color-mix in oklab', () => {
    expect(mixOklab('#000000', 0, '#ffffff')).toBe('#ffffff');
    expect(mixOklab('#000000', 100, '#ffffff')).toBe('#000000');
    expect(mixOklab('#111318', 4, '#ffffff')).toBe('#f4f4f4');
  });

  it.each(cases)(
    'text on tinted containers reaches 4.5:1 ($label)',
    ({ label, values }) => {
      for (const [bg, text] of TINT_PAIRS) {
        expect(
          contrast(at(values, text), at(values, bg)),
          `${label}: --${text} on --${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it.each(cases)(
    'label text on solid fills reaches 4.5:1 ($label)',
    ({ label, values }) => {
      for (const [bg, text] of FILL_PAIRS) {
        expect(
          contrast(at(values, text), at(values, bg)),
          `${label}: --${text} on --${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it.each(cases)(
    'tag text reaches 4.5:1 on its own container ($label)',
    ({ label, values }) => {
      const surface = at(values, 'surface');
      for (const hue of TAG_HUES) {
        const container = blendOver(
          at(values, `tag-${hue}-container`),
          surface,
        );
        expect(
          contrast(at(values, `tag-${hue}`), container),
          `${label}: --tag-${hue} on its container`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it.each(cases)(
    'tag text reaches 4.5:1 straight on surfaces ($label)',
    ({ label, values }) => {
      for (const surface of SURFACES) {
        for (const hue of TAG_HUES.filter((name) => name !== 'neutral')) {
          expect(
            contrast(at(values, `tag-${hue}`), at(values, surface)),
            `${label}: --tag-${hue} on --${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );

  it.each(cases)(
    'focus ring reaches 3:1 on surfaces and tints ($label)',
    ({ label, values }) => {
      for (const bg of [
        'background',
        'surface',
        'hover-row',
        'primary-light',
        'sidebar-accent',
      ]) {
        expect(
          contrast(at(values, 'primary-highlight'), at(values, bg)),
          `${label}: --primary-highlight on --${bg}`,
        ).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it.each(cases)(
    'focus ring reaches 3:1 on menus, dialogs and the highlighted item ($label)',
    ({ label, values }) => {
      for (const bg of ['popover', 'surface-elevated', 'brand-tint']) {
        expect(
          contrast(at(values, 'primary-highlight'), at(values, bg)),
          `${label}: --primary-highlight on --${bg}`,
        ).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it.each(cases)(
    'brand fill and the switch-off track reach 3:1 as graphics ($label)',
    ({ label, values }) => {
      for (const bg of ['surface', 'background', 'surface-elevated']) {
        for (const mark of ['brand', 'switch-off']) {
          expect(
            contrast(at(values, mark), at(values, bg)),
            `${label}: --${mark} on --${bg}`,
          ).toBeGreaterThanOrEqual(3);
        }
      }
    },
  );

  it.each(cases)(
    'row hover stands out from the surface and the popover ($label)',
    ({ label, values }) => {
      expect(
        contrast(at(values, 'hover-row'), at(values, 'surface')),
        `${label}: --hover-row on --surface`,
      ).toBeGreaterThanOrEqual(1.2);
      expect(
        contrast(at(values, 'hover-row'), at(values, 'popover')),
        `${label}: --hover-row on --popover`,
      ).toBeGreaterThanOrEqual(1.1);
    },
  );
});

/**
 * Dark mode has no shadow to lift a layer, so lightness does it: a menu or a
 * dialog must be lighter than the page under it, never darker.
 */
describe('design tokens: dark elevation ladder, every preset', () => {
  const LADDER = [
    'background',
    'surface',
    'surface-elevated',
    'popover',
  ] as const;

  it.each(PRESETS)('each raised layer is lighter ($id)', (preset) => {
    const values = modeValues(preset, 'dark');
    for (let i = 1; i < LADDER.length; i += 1) {
      const lower = LADDER[i - 1] ?? 'background';
      const upper = LADDER[i] ?? 'background';
      expect(
        contrast(at(values, upper), at(values, lower)),
        `${preset.id} dark: --${upper} over --${lower}`,
      ).toBeGreaterThan(1.04);
      expect(luminance(at(values, upper))).toBeGreaterThan(
        luminance(at(values, lower)),
      );
    }
  });
});
