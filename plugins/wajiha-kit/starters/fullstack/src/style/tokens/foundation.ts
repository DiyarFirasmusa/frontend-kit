/**
 * Non-colour tokens, the same for every preset and for both parts of the project (the public site and the
 * admin). `generate-css.ts` turns this file into `src/style/theme.css`. Edit here, run `npm run tokens`,
 * never edit the generated CSS.
 */

/**
 * Self-hosted fonts only (no font CDN). Arabic pages use Cairo, which also draws Latin; English pages use
 * the system UI font, so they download no font at all. Every stack ends in fonts that exist on Windows,
 * macOS, Android and Linux. `--font-body` switches with `<html lang>`.
 */
export const FONT_STACKS = {
  arabic:
    "'Cairo Variable', 'Segoe UI', Tahoma, 'Noto Naskh Arabic', 'Geeza Pro', system-ui, sans-serif",
  latin: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

export const FONTS = {
  sans: 'var(--font-body)',
  heading: 'var(--font-body)',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

/**
 * Spacing by role. Names are roles, never xs/sm/md/lg: those keys would shadow Tailwind's container scale
 * and silently break max-w-md and friends.
 *   field    8px  label to value, tab to tab, badge/button internal gap
 *   inline  12px  icon tile to title, nav item to nav item
 *   row     16px  field row to field row, control inline padding
 *   panel   20px  padded section
 *   card    24px  card padding, card to card, page blocks
 *   frame   32px  admin page padding (not "page": max-w-page would read it and shrink to 32px)
 *   gutter        site page side padding (grows with the screen)
 *   section       space between site page sections (grows with the screen)
 */
export const SPACING = {
  field: '8px',
  inline: '12px',
  row: '16px',
  panel: '20px',
  card: '24px',
  frame: '32px',
  gutter: 'clamp(1rem, 4vw, 2rem)',
  section: 'clamp(3rem, 7vw, 5.5rem)',
} as const;

/** Content widths (max-w-page, max-w-prose). */
export const CONTAINERS = {
  page: '72rem',
  prose: '42rem',
} as const;

/** Tailwind font-size keys. Arabic needs the taller line heights; the large sizes grow with the screen. */
export const FONT_SIZES = [
  ['xs', '0.8125rem', '1.5'],
  ['sm', '0.9375rem', '1.65'],
  ['base', '1.0625rem', '1.8'],
  ['lg', '1.1875rem', '1.7'],
  ['xl', '1.375rem', '1.5'],
  ['2xl', 'clamp(1.5rem, 1.2rem + 1.2vw, 1.875rem)', '1.35'],
  ['3xl', 'clamp(1.875rem, 1.4rem + 2vw, 2.5rem)', '1.25'],
  ['4xl', 'clamp(2.25rem, 1.5rem + 3.2vw, 3.5rem)', '1.2'],
] as const;

export const RADII = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '1rem',
  xl: '1.25rem',
  control: '10px',
  nav: '12px',
  kpi: '16px',
  modal: '20px',
  pagination: '7px',
  kbd: '6px',
  pill: '999px',
} as const;

export const SHADOWS = {
  small: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  mid: '0 1px 2px rgb(0 0 0 / 0.05), 0 8px 24px rgb(0 0 0 / 0.06)',
  large: '0 4px 16px 0 rgb(0 0 0 / 0.08)',
  xlarge: '0 18px 44px 0 rgb(0 0 0 / 0.24)',
} as const;

export const MOTION = {
  'ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'duration-fast': '120ms',
  'duration-base': '180ms',
  'duration-slow': '280ms',
} as const;

/** Control heights. `data-density="compact"` on <html> swaps in the second set. */
export const DENSITY = {
  comfortable: {
    'control-h-lg': '44px',
    'control-h': '40px',
    'control-h-sm': '32px',
    'control-h-xs': '28px',
    'field-h': '44px',
  },
  compact: {
    'control-h-lg': '40px',
    'control-h': '34px',
    'control-h-sm': '30px',
    'control-h-xs': '26px',
    'field-h': '36px',
  },
} as const;

export interface TypeStyle {
  weight: number;
  size: number;
  line: number;
  family: 'sans' | 'heading';
}

/**
 * Type ramp for dense screens (the admin). One utility per named style; each sets size, line-height,
 * weight and family together, so never pair it with font-* or tracking-* classes.
 */
export const TYPE_RAMP: Readonly<Record<string, TypeStyle>> = {
  'text-h1': { weight: 700, size: 26, line: 36, family: 'heading' },
  'text-h2': { weight: 700, size: 22, line: 30, family: 'heading' },
  'text-h3': { weight: 700, size: 18, line: 27, family: 'heading' },
  'text-h4': { weight: 700, size: 16, line: 24, family: 'heading' },
  'text-h5': { weight: 600, size: 14, line: 21, family: 'sans' },
  'text-b1': { weight: 400, size: 14, line: 22, family: 'sans' },
  'text-b2': { weight: 400, size: 13, line: 20, family: 'sans' },
  'text-b3': { weight: 400, size: 12, line: 18, family: 'sans' },
  'text-button-1': { weight: 600, size: 14, line: 21, family: 'sans' },
  'text-button-2': { weight: 600, size: 13, line: 20, family: 'sans' },
  'text-label': { weight: 600, size: 13, line: 20, family: 'sans' },
  'text-table-header': { weight: 600, size: 12, line: 18, family: 'sans' },
  'text-table-id': { weight: 700, size: 13, line: 20, family: 'heading' },
  'text-kpi': { weight: 700, size: 30, line: 36, family: 'heading' },
};
