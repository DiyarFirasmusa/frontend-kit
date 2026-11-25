import { useTranslation } from 'react-i18next';
import {
  useBackAction,
  useNavigateAction,
} from '@/features/fallback/error-state';
import { useLogout } from '@/hooks/use-logout';
import { Home } from '@/lib/icons';
import { ErrorPage } from '../error-page';

export default function ForbiddenErrorContainer() {
  const goHome = useNavigateAction('/');
  const goBack = useBackAction();
  const logout = useLogout();
  const { t } = useTranslation();

  return (
    <ErrorPage
      kind="forbidden"
      standalone
      title={t('errorPages.forbidden.title')}
      primary={{
        label: t('errorPages.goBack'),
        onClick: goBack,
        icon: null,
      }}
      secondary={{ label: t('errorPages.goHome'), onClick: goHome, icon: Home }}
      extra={{
        label: t('errorPages.forbidden.signInAgain'),
        onClick: () => {
          void logout();
        },
      }}
      details={[
        {
          label: t('errorPages.states.forbidden.action'),
          value: t('errorPages.states.forbidden.actionValue'),
        },
        {
          label: t('errorPages.states.forbidden.status'),
          value: t('errorPages.states.forbidden.statusValue'),
        },
      ]}
    />
  );
}
