import { useTranslation } from 'react-i18next';
import {
  ErrorState,
  useBackAction,
  useNavigateAction,
} from '@/features/fallback/error-state';
import { Lock } from '@/lib/icons';

/* 401 keeps sign-in as the primary action: a signed-out visitor can act on it
   directly, while going home would only bounce them back to the login form. */
export default function UnauthorizedErrorContainer() {
  const goSignIn = useNavigateAction('/login');
  const goBack = useBackAction();
  const { t } = useTranslation();
  return (
    <ErrorState
      code="401"
      title={t('errorPages.unauthorized.title')}
      description={t('errorPages.unauthorized.description')}
      icon={Lock}
      tone="warning"
      primary={{ label: t('common.signIn'), onClick: goSignIn }}
      secondary={{ label: t('errorPages.goBack'), onClick: goBack }}
    />
  );
}
