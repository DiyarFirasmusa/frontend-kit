import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorPage } from '@/features/fallback/error-page';
import {
  useBackAction,
  useNavigateAction,
} from '@/features/fallback/error-state';
import { buildErrorDetails } from '@/features/fallback/utils/error-details';

export default function ServerErrorContainer() {
  const goHome = useNavigateAction('/');
  const goBack = useBackAction();
  const { t } = useTranslation();
  const [occurredAt] = useState(() => new Date().toISOString());
  return (
    <ErrorPage
      standalone
      kind="server"
      primary={{ label: t('errorPages.retry'), onClick: goBack }}
      secondary={{ label: t('errorPages.goHome'), onClick: goHome }}
      details={buildErrorDetails(t, {
        kind: 'server',
        occurredAt,
        status: 500,
        page: '/500',
      })}
    />
  );
}
