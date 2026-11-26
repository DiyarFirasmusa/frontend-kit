import { useRouterState } from '@tanstack/react-router';
import {
  LANGUAGES,
  LOCALE_COOKIE,
  otherLocales,
  swapLocaleInPath,
  type Locale,
} from '@/shared/lib/i18n/languages';

/** Remembers the visitor's choice in the cookie the "/" redirect reads. */
function rememberLanguage(target: Locale): void {
  // Set from script, so it cannot be HttpOnly; Secure whenever the page itself is on HTTPS.
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax${secure}`;
}

/**
 * Plain links to the same page in every other language (one link for two languages, a short list for more):
 * crawlable, and the language is the URL. Each shows the language's own name, from LANGUAGES.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <>
      {otherLocales(locale).map((target) => (
        <a
          key={target}
          href={swapLocaleInPath(pathname, target)}
          hrefLang={LANGUAGES[target].hreflang}
          lang={target}
          onClick={() => rememberLanguage(target)}
          className="border-border bg-surface text-text hover:bg-surface-sunken inline-flex min-h-11 items-center rounded-md border px-4 font-semibold"
        >
          {LANGUAGES[target].label}
        </a>
      ))}
    </>
  );
}
