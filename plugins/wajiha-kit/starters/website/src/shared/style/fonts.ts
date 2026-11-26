import cairoArabicFont from '@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2?url';
import cairoLatinFont from '@fontsource-variable/cairo/files/cairo-latin-wght-normal.woff2?url';
import type { Locale } from '@/shared/lib/i18n/languages';

/**
 * Font files to preload per language (the `@font-face` rules come from the font package, imported in
 * styles.css). Arabic pages paint Arabic letters plus Latin digits and punctuation, so both files; English
 * uses the system font stack and preloads nothing. The type is a record over `Locale`, so a new language in
 * LOCALES fails the typecheck here until it says what it preloads (an empty list is a valid answer).
 */
export const PRELOAD_FONTS: Record<Locale, readonly string[]> = {
  ar: [cairoArabicFont, cairoLatinFont],
  en: [],
};
