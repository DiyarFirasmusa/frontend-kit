/**
 * The one list of app languages. To add a language: add it here, add
 * `src/locales/<code>.json` (and `features/<name>/locales/<code>.json`), import it
 * in `i18n.ts`, and add its code to the RTL list in `public/theme-init.js` if it
 * is right-to-left (a test fails when those two disagree).
 */
export interface LanguageConfig {
  /** Name in its own language, shown in menus. */
  label: string;
  /** Translation key for its name in the current UI language (language menu). */
  nameKey: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES = {
  ar: { label: 'العربية', nameKey: 'shell.language.arabic', dir: 'rtl' },
  en: { label: 'English', nameKey: 'shell.language.english', dir: 'ltr' },
} as const satisfies Record<string, LanguageConfig>;

export type SupportedLanguage = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as SupportedLanguage[];

export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return typeof value === 'string' && Object.hasOwn(LANGUAGES, value);
}

/** Direction of a language code, `rtl` for the ones the config marks so. */
export function directionOf(code: string | undefined): 'ltr' | 'rtl' {
  const base = (code ?? DEFAULT_LANGUAGE).split('-')[0];
  return isSupportedLanguage(base) ? LANGUAGES[base].dir : 'ltr';
}
