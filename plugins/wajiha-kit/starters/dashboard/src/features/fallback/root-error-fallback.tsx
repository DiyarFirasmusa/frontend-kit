import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { classifyError } from '@/api/error/utils/classify';
import { getDir } from '@/lib/i18n/i18n';
import { useAuthStore } from '@/store/auth-store';
import { ErrorPage } from './error-page';
import { buildErrorDetails } from './utils/error-details';

/* Rendered by the root boundary, which sits above ThemeProvider. The theme,
   preset, lang and dir attributes were already set on <html> by
   public/theme-init.js before first paint; this only re-applies lang/dir for
   the language i18n resolved, so an error during provider render cannot leave
   an English user inside the RTL default. */
interface RootErrorFallbackProps {
  error?: unknown;
}

export function RootErrorFallback({ error }: RootErrorFallbackProps) {
  const { t, i18n } = useTranslation();
  const [occurredAt] = useState(() => new Date().toISOString());
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const dir = getDir(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const kind = classifyError(error);
  return (
    <ErrorPage
      standalone
      kind={kind}
      primary={{
        label: t('errorPages.reload'),
        onClick: () => {
          window.location.reload();
        },
      }}
      secondary={{
        label: t('errorPages.goHome'),
        onClick: () => {
          window.location.assign('/');
        },
      }}
      extra={
        kind === 'unexpected'
          ? {
              label: t('errorPages.signInAgain'),
              onClick: () => {
                useAuthStore.getState().clear();
                window.location.assign('/login');
              },
            }
          : undefined
      }
      details={buildErrorDetails(t, {
        kind,
        occurredAt,
        page: window.location.pathname,
      })}
    />
  );
}
