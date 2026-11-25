import type { BadgeTone } from '@/components/table/data-badge';
import { cn } from '@/lib/utils';
import { TONE_FILL, TONE_TEXT } from '../utils/home-tones';

export interface HomeStatusDotProps {
  tone: BadgeTone;
  label: string;
  /** Colour the word in the tone's hue (default) or keep it in the primary text colour. */
  tintLabel?: boolean;
}

/** Status shown as a word with a small dot in the tone's colour, without a tinted box. */
export function HomeStatusDot({
  tone,
  label,
  tintLabel = true,
}: HomeStatusDotProps) {
  return (
    <span
      className={cn(
        'text-label inline-flex items-center gap-1.5 whitespace-nowrap rtl:flex-row-reverse',
        tintLabel ? TONE_TEXT[tone] : 'text-text-primary',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 shrink-0 rounded-full', TONE_FILL[tone])}
      />
      {label}
    </span>
  );
}
