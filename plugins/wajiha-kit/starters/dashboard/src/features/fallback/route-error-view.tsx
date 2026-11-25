import {
  useNavigate,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { classifyError, getErrorRequestInfo } from '@/api/error/utils/classify';
import { useLogout } from '@/hooks/use-logout';
import { ErrorPage } from './error-page';
import { buildErrorDetails } from './utils/error-details';

/**
 * Error boundary for the dashboard routes: a page that throws while rendering
 * or loading lands here, inside the shell, as a network, server or
 * unexpected-error page. Retry resets the boundary and reloads the route.
 */
export function RouteErrorView({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const navigate = useNavigate();
  const logout = useLogout();
  const page = useRouterState({ select: (s) => s.location.pathname });
  const [occurredAt] = useState(() => new Date().toISOString());
  const kind = classifyError(error);

  return (
    <ErrorPage
      kind={kind}
      primary={{
        label: t(
          kind === 'unexpected' ? 'errorPages.reload' : 'errorPages.retry',
        ),
        onClick: () => {
          reset();
          void router.invalidate();
        },
      }}
      secondary={{
        label: t('errorPages.goHome'),
        onClick: () => {
          reset();
          void navigate({ to: '/' });
        },
      }}
      extra={
        kind === 'unexpected'
          ? {
              label: t('errorPages.signInAgain'),
              onClick: () => {
                void logout();
              },
            }
          : undefined
      }
      details={buildErrorDetails(t, {
        kind,
        page,
        occurredAt,
        ...getErrorRequestInfo(error),
      })}
    />
  );
}
