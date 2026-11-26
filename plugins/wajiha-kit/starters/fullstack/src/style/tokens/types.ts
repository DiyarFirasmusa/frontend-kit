/**
 * Colour token contract. Every preset must give a value for each name below in
 * both modes; TypeScript refuses an incomplete preset. Names are roles, not
 * colours: a component asks for `text-muted` or `surface`, never for a hue.
 *
 * The status and tag hues are shared by all presets (see `status.ts`), so they
 * are not part of the preset contract.
 */

/** Tokens a preset chooses by hand. */
export const PRESET_TOKEN_NAMES = [
  // surfaces
  'background',
  'surface',
  'surface-dim',
  'popover',
  'surface-elevated',
  'secondary',
  'muted',
  'hover-row',
  'surface-solid-secondary',
  'kbd',
  'switch-off',
  'scrim',
  // text
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-inactive',
  // brand. `primary` is a FILL colour: use `primary-text` for text.
  'primary',
  'primary-foreground',
  'primary-hover',
  'primary-container',
  'primary-text',
  'primary-highlight',
  'primary-light',
  'primary-tint',
  'brand-light',
  'brand-dark',
  // login-page brand panel: the same dark gradient in both modes, white text on it
  'brand-panel-from',
  'brand-panel-to',
  // strokes
  'stroke',
  'stroke-subtle',
  'stroke-strong',
  // border of a form control: 3:1 on every surface (WCAG 1.4.11)
  'stroke-control',
  // neutral ramp
  'neutral-700',
  'neutral-600',
  'neutral-500',
  'neutral-400',
  'neutral-300',
  'neutral-200',
  'neutral-50',
  // sidebar
  'sidebar',
  'sidebar-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-selected',
  'sidebar-selected-foreground',
  'sidebar-border',
  // charts
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const;

export type PresetTokenName = (typeof PRESET_TOKEN_NAMES)[number];

export type ModeTokens = Record<PresetTokenName, string>;

export type Mode = 'light' | 'dark';

export const TAG_HUES = [
  'green',
  'red',
  'yellow',
  'orange',
  'cyan',
  'purple',
  'blue',
  'neutral',
] as const;

export type TagHue = (typeof TAG_HUES)[number];

export interface Preset {
  /** Value of `data-preset` on <html>. */
  id: string;
  /** Short label for a theme picker. */
  label: string;
  light: ModeTokens;
  dark: ModeTokens;
}

/** Tokens that are only a `var()` pointing at another token, the same in every preset. */
export const ALIAS_TOKENS: Readonly<Record<string, string>> = {
  brand: 'primary',
  'neutral-100': 'surface-solid-secondary',
  'disabled-container': 'surface-solid-secondary',
  'surface-border': 'stroke',
  border: 'stroke',
  input: 'stroke',
  destructive: 'danger',
  'sidebar-active': 'sidebar-accent',
  'sidebar-ring': 'primary-highlight',
  foreground: 'text-primary',
  card: 'surface',
  'card-foreground': 'text-primary',
  'popover-foreground': 'text-primary',
  'secondary-foreground': 'text-primary',
  'muted-foreground': 'text-secondary',
  accent: 'primary-light',
  'accent-foreground': 'primary-text',
  ring: 'primary-highlight',
};

export const STATUS_NAMES = ['success', 'warning', 'danger', 'info'] as const;
