import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { RADII, SHADOWS, SPACING, TYPE_RAMP } from '@/style/tokens/foundation';

const RAMP = Object.keys(TYPE_RAMP);

/* tailwind-merge only knows stock Tailwind. Without this, `text-h1` (a type
   ramp utility) would be read as a text COLOUR and dropped whenever a real
   colour such as `text-text-primary` follows it. */
const twMerge = extendTailwindMerge<'type-ramp'>({
  extend: {
    theme: {
      spacing: Object.keys(SPACING),
      radius: Object.keys(RADII),
      shadow: Object.keys(SHADOWS),
    },
    classGroups: { 'type-ramp': RAMP },
    conflictingClassGroups: {
      'type-ramp': ['font-size', 'font-weight', 'leading', 'font-family'],
      'font-size': ['type-ramp'],
      'font-weight': ['type-ramp'],
      leading: ['type-ramp'],
    },
  },
});

/** Joins class names; when two Tailwind classes conflict, the later one wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
