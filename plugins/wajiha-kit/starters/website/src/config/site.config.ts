// Site-wide facts in one place. Names are per language; everything else is language-free.
// The business is fictional: replace these values (and the locale bundles) for a real project.
import type { Locale } from '@/shared/lib/i18n/languages';

export const SITE = {
  names: { ar: 'شركة المثال', en: 'Example Company' } satisfies Record<Locale, string>,
  email: 'hello@example.com',
  phone: '+000 000 000 0000',
  /** Share image: 1200x630 PNG in /public. Chat apps do not read SVG. */
  ogImage: { path: '/og-default.png', width: 1200, height: 630 },
  /** Brand colour, matches --color-primary in tokens.css (light). */
  themeColor: '#0f6b5c',
} as const;

export function siteName(locale: Locale): string {
  return SITE.names[locale];
}
