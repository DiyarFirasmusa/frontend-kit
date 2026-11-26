import type { Mode, ModeTokens, TagHue } from './types.ts';

/**
 * Status and tag hues, shared by every preset so "red means danger" never
 * changes with the brand colour. Values were picked so each hue reaches 4.5:1
 * on every surface and on its own 9% container (checked by contrast.test.ts).
 */
const HUES: Record<Mode, Record<Exclude<TagHue, 'purple' | 'neutral'>, string>> = {
  light: {
    green: '#1b6b3a',
    red: '#b3262f',
    yellow: '#80560a',
    orange: '#a14a00',
    cyan: '#0b6275',
    blue: '#2755b8',
  },
  dark: {
    green: '#6ccf8e',
    red: '#ff8a90',
    yellow: '#e6b45c',
    orange: '#f0a05a',
    cyan: '#5fc8dd',
    blue: '#86a9ff',
  },
};

const FILL_FOREGROUND: Record<Mode, string> = {
  light: '#ffffff',
  dark: '#0e0f12',
};

/** Parses #rrggbb into the `r g b` triple used by `rgb(r g b / a)`. */
function triple(hex: string): string {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return channels.join(' ');
}

function container(hex: string): string {
  return `rgb(${triple(hex)} / 0.09)`;
}

export interface StatusTokens {
  [name: string]: string;
}

/**
 * Status fills plus the eight tag colour/container pairs for one mode.
 * `purple` follows the preset's brand text colour and `neutral` its secondary
 * text colour, so those two tags always match the preset.
 */
export function statusTokens(
  mode: Mode,
  preset: Pick<ModeTokens, 'primary-text' | 'text-secondary'>,
): StatusTokens {
  const hues = HUES[mode];
  const colours: Record<TagHue, string> = {
    ...hues,
    purple: preset['primary-text'],
    neutral: preset['text-secondary'],
  };
  const out: StatusTokens = {
    success: hues.green,
    'success-foreground': FILL_FOREGROUND[mode],
    warning: hues.yellow,
    'warning-foreground': FILL_FOREGROUND[mode],
    danger: hues.red,
    'danger-foreground': FILL_FOREGROUND[mode],
    info: hues.blue,
    'info-foreground': FILL_FOREGROUND[mode],
  };
  for (const [hue, hex] of Object.entries(colours)) {
    out[`tag-${hue}`] = hex;
    out[`tag-${hue}-container`] = container(hex);
  }
  return out;
}
