import { useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buttonPrimary } from '@/shared/components/button-styles';
import { Container } from '@/shared/components/container';

/** Shown with HTTP 500 when a route throws. It never prints the error, a stack or a message. */
export function DefaultCatchBoundary({ reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Container className="py-section" role="alert">
      <h1 className="text-4xl">{t('error.errorTitle')}</h1>
      <p className="text-muted mt-4 max-w-prose text-lg">{t('error.errorText')}</p>
      <button
        type="button"
        className={`${buttonPrimary} mt-8`}
        onClick={() => {
          reset();
          void router.invalidate();
        }}
      >
        {t('error.retry')}
      </button>
    </Container>
  );
}
