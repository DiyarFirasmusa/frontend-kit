import type { BadgeTone } from '@/components/table/data-badge';

/** Readable text in the tone's hue. */
export const TONE_TEXT: Record<BadgeTone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
  neutral: 'text-text-secondary',
  brand: 'text-brand-text',
};

/** Solid fills: status dots, accent bars, progress fills. */
export const TONE_FILL: Record<BadgeTone, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
  neutral: 'bg-text-muted',
  brand: 'bg-brand',
};

/** Tinted box with text in the same hue (tag container pairs, AA over the surface). */
export const TONE_TINT: Record<BadgeTone, string> = {
  success: 'bg-tag-green-container text-tag-green',
  danger: 'bg-tag-red-container text-tag-red',
  warning: 'bg-tag-orange-container text-tag-orange',
  info: 'bg-tag-blue-container text-tag-blue',
  neutral: 'bg-tag-neutral-container text-text-secondary',
  brand: 'bg-brand-tint text-brand-text',
};

/** Start-edge accent border on a highlighted card or row. */
export const TONE_ACCENT_BORDER: Record<BadgeTone, string> = {
  success: 'border-s-success',
  danger: 'border-s-danger',
  warning: 'border-s-warning',
  info: 'border-s-info',
  neutral: 'border-s-stroke-strong',
  brand: 'border-s-brand',
};
