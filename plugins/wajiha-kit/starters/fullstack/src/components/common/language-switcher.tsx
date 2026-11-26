import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGES,
  LOCALE_COOKIE,
  otherLocale,
  swapLocaleInPath,
  type Locale,
} from '@/shared/lib/i18n/languages';

/** A plain link to the same page in the other language: crawlable, and the language is the URL. */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  // The query string and hash travel with the link: a filtered list and a login ?redirect= survive the switch.
  const { pathname, searchStr, hash } = useRouterState({
    select: (state) => state.location,
  });
  const tail = hash === '' ? '' : `#${hash.replace(/^#/, '')}`;
  const target = otherLocale(locale);
  const remember = () => {
    // Set from script, so it cannot be HttpOnly; Secure whenever the page itself is on HTTPS.
    const secure = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax${secure}`;
  };
  return (
    <a
      href={`${swapLocaleInPath(pathname, target)}${searchStr}${tail}`}
      hrefLang={LANGUAGES[target].hreflang}
      lang={target}
      onClick={remember}
      className="border-stroke bg-surface text-text-primary hover:bg-muted inline-flex min-h-11 items-center rounded-md border px-4 font-semibold"
    >
      {t('common.switchLanguage')}
    </a>
  );
}
