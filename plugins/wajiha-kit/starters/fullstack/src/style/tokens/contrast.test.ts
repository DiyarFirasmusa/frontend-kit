import { describe, expect, it } from 'vitest';
import { blendOver, contrast } from './contrast';
import { modeValues } from './generate-css';
import { PRESETS } from './presets';
import { TAG_HUES, type Mode } from './types';

/**
 * WCAG AA gate for every preset in both modes: 4.5:1 for text on the surfaces
 * and tints the app puts text on, 3:1 for the focus ring. Adding a preset adds
 * its cases here without touching this file.
 *
 * Not covered on purpose: --text-inactive (disabled labels are exempt from
 * WCAG 1.4.3). Placeholders and secondary copy use --text-muted, covered below.
 */

const SURFACES = ['background', 'surface', 'surface-dim', 'hover-row', 'sidebar'] as const;

const TEXT = [
  'text-primary',
  'text-secondary',
  'text-muted',
  'primary-text',
  'success',
  'warning',
  'danger',
  'info',
] as const;

const TINT_PAIRS = [
  ['primary-light', 'primary-text'],
  ['primary-light', 'text-primary'],
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
  it.each(cases)('text tokens reach 4.5:1 on surfaces ($label)', ({ label, values }) => {
    for (const surface of SURFACES) {
      for (const text of TEXT) {
        expect(
          contrast(at(values, text), at(values, surface)),
          `${label}: --${text} on --${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(cases)('text on tinted containers reaches 4.5:1 ($label)', ({ label, values }) => {
    for (const [bg, text] of TINT_PAIRS) {
      expect(
        contrast(at(values, text), at(values, bg)),
        `${label}: --${text} on --${bg}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(cases)('label text on solid fills reaches 4.5:1 ($label)', ({ label, values }) => {
    for (const [bg, text] of FILL_PAIRS) {
      expect(
        contrast(at(values, text), at(values, bg)),
        `${label}: --${text} on --${bg}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(cases)('tag text reaches 4.5:1 on its own container ($label)', ({ label, values }) => {
    const surface = at(values, 'surface');
    for (const hue of TAG_HUES) {
      const container = blendOver(at(values, `tag-${hue}-container`), surface);
      expect(
        contrast(at(values, `tag-${hue}`), container),
        `${label}: --tag-${hue} on its container`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(cases)('tag text reaches 4.5:1 straight on surfaces ($label)', ({ label, values }) => {
    for (const surface of SURFACES) {
      for (const hue of TAG_HUES.filter((name) => name !== 'neutral')) {
        expect(
          contrast(at(values, `tag-${hue}`), at(values, surface)),
          `${label}: --tag-${hue} on --${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(cases)('form control borders reach 3:1 on surfaces ($label)', ({ label, values }) => {
    for (const bg of ['background', 'surface', 'surface-dim', 'muted']) {
      expect(
        contrast(at(values, 'stroke-control'), at(values, bg)),
        `${label}: --stroke-control on --${bg}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(cases)('focus ring reaches 3:1 on surfaces and tints ($label)', ({ label, values }) => {
    for (const bg of [
      'background',
      'surface',
      'hover-row',
      'primary-light',
      'sidebar-accent',
      'muted',
    ]) {
      expect(
        contrast(at(values, 'primary-highlight'), at(values, bg)),
        `${label}: --primary-highlight on --${bg}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });
});
