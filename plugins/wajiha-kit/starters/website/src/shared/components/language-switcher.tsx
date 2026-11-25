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
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const target = otherLocale(locale);
  const remember = () => {
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
  };
  return (
    <a
      href={swapLocaleInPath(pathname, target)}
      hrefLang={LANGUAGES[target].hreflang}
      lang={target}
      onClick={remember}
      className="border-border bg-surface text-text hover:bg-surface-sunken inline-flex min-h-11 items-center rounded-md border px-4 font-semibold"
    >
      {t('common.switchLanguage')}
    </a>
  );
}
