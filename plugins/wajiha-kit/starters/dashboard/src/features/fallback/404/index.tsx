import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  useBackAction,
  useNavigateAction,
} from '@/features/fallback/error-state';
import { Home } from '@/lib/icons';
import { ErrorPage } from '../error-page';

export default function NotFoundErrorContainer() {
  const goHome = useNavigateAction('/');
  const goBack = useBackAction();
  const { t } = useTranslation();
  const page = useRouterState({ select: (s) => s.location.pathname });

  return (
    <ErrorPage
      kind="notFound"
      standalone
      primary={{
        label: t('errorPages.states.notFound.backToList'),
        onClick: goBack,
        icon: null,
      }}
      secondary={{ label: t('nav.dashboard'), onClick: goHome, icon: Home }}
      detailsAction={{
        label: t('errorPages.states.notFound.backToList'),
        onClick: goBack,
      }}
      details={[
        {
          label: t('errorPages.states.notFound.kind'),
          value: t('errorPages.states.notFound.kindValue'),
        },
        {
          label: t('errorPages.states.notFound.requested'),
          value: page,
          ltr: true,
        },
        {
          label: t('errorPages.states.notFound.scope'),
          value: t('errorPages.states.notFound.scopeValue'),
        },
        {
          label: t('errorPages.states.notFound.result'),
          value: t('errorPages.states.notFound.resultValue'),
        },
      ]}
    />
  );
}
