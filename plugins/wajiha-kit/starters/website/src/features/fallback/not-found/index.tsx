import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buttonPrimary } from '@/shared/components/button-styles';
import { Container } from '@/shared/components/container';
import { toLocale } from '@/shared/lib/i18n/languages';

/** Rendered with HTTP 404. The site header and footer stay when the language is in the URL. */
export function NotFound() {
  const { t, i18n } = useTranslation();
  return (
    <Container className="py-section">
      <h1 className="text-4xl">{t('error.notFoundTitle')}</h1>
      <p className="text-muted mt-4 max-w-prose text-lg">{t('error.notFoundText')}</p>
      <Link
        to="/$locale"
        params={{ locale: toLocale(i18n.language) }}
        className={`${buttonPrimary} mt-8`}
      >
        {t('error.goHome')}
      </Link>
    </Container>
  );
}
