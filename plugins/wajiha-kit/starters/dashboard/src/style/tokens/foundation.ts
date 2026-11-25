/**
 * Non-colour tokens, the same for every preset. `generate-css.ts` turns this
 * file into `src/style/theme.css`. Edit here, run `npm run tokens`, never edit
 * the generated CSS.
 */

export const FONTS = {
  sans: "'IBM Plex Sans', 'IBM Plex Sans Arabic', 'Cairo Variable', system-ui, 'Segoe UI', Tahoma, sans-serif",
  heading:
    "'Cairo Variable', 'IBM Plex Sans Arabic', system-ui, 'Segoe UI', Tahoma, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

/**
 * Spacing by role. Names are roles, never xs/sm/md/lg: those keys would shadow
 * Tailwind's container scale and silently break max-w-md and friends.
 *   field   8px  label to value, tab to tab, badge/button internal gap
 *   inline 12px  icon tile to title, nav item to nav item
 *   row    16px  field row to field row, control inline padding
 *   panel  20px  padded section
 *   card   24px  card padding, card to card, page blocks
 *   page   32px  page padding
 */
export const SPACING = {
  field: '8px',
  inline: '12px',
  row: '16px',
  panel: '20px',
  card: '24px',
  page: '32px',
} as const;

/** Tailwind font-size keys, kept at the design scale. */
export const FONT_SIZES = [
  ['xs', '12px', '1.5'],
  ['sm', '14px', '1.5'],
  ['base', '16px', '1.6'],
  ['lg', '18px', '1.5'],
  ['xl', '20px', '1.35'],
  ['2xl', '24px', '1.3'],
  ['3xl', '30px', '1.25'],
  ['4xl', '36px', '1.2'],
] as const;

export const RADII = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: 'var(--radius)',
  xl: '1rem',
  '2xl': '1.25rem',
  '3xl': '1.5rem',
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
  mid: '0 2px 8px 0 rgb(0 0 0 / 0.06)',
  large: '0 4px 16px 0 rgb(0 0 0 / 0.08)',
  xlarge: '0 18px 44px 0 rgb(0 0 0 / 0.24)',
  /** Glow under primary actions; follows the preset's brand colour. */
  primary: '0 8px 24px 0 color-mix(in srgb, var(--primary) 24%, transparent)',
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
    'control-h': '38px',
    'control-h-sm': '32px',
    'control-h-xs': '28px',
    'field-h': '42px',
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
 * Type ramp. One utility per named style; each sets size, line-height, weight
 * and family together, so never pair it with font-* or tracking-* classes.
 * Cairo (heading) carries titles and numbers, IBM Plex Sans the rest.
 */
export const TYPE_RAMP: Readonly<Record<string, TypeStyle>> = {
  'text-h1': { weight: 700, size: 28, line: 33.6, family: 'heading' },
  'text-h2': { weight: 700, size: 24, line: 26.4, family: 'heading' },
  'text-h3': { weight: 700, size: 20, line: 26, family: 'heading' },
  'text-h4': { weight: 700, size: 16, line: 24, family: 'heading' },
  'text-h5': { weight: 600, size: 14, line: 21, family: 'sans' },
  'text-b1': { weight: 400, size: 14, line: 21, family: 'sans' },
  'text-b2': { weight: 400, size: 13, line: 19.5, family: 'sans' },
  'text-b3': { weight: 400, size: 12, line: 18, family: 'sans' },
  'text-button-1': { weight: 600, size: 14, line: 21, family: 'sans' },
  'text-button-2': { weight: 600, size: 13, line: 19.5, family: 'sans' },
  'text-label': { weight: 600, size: 12, line: 18, family: 'sans' },
  'text-table-header': { weight: 400, size: 11, line: 16.5, family: 'sans' },
  'text-table-id': { weight: 700, size: 13, line: 19.5, family: 'heading' },
  'text-kpi': { weight: 700, size: 30, line: 28.5, family: 'heading' },
  'text-metric': { weight: 700, size: 24, line: 36, family: 'heading' },
  'text-display': { weight: 700, size: 28, line: 42, family: 'heading' },
};
