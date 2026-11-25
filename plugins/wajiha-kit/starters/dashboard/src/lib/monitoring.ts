import type { captureException as captureSentryException } from '@sentry/react';
import type { AnyRouter } from '@tanstack/react-router';
import { env } from '@/env';

type CaptureException = typeof captureSentryException;
interface SentryReporter {
  captureException: CaptureException;
}

let router: AnyRouter | undefined;
let initialization: Promise<SentryReporter> | null = null;

export function configureMonitoring(appRouter: AnyRouter): void {
  router = appRouter;
}

export async function initSentry(): Promise<SentryReporter | null> {
  if (import.meta.env.PROD && !import.meta.env.VITE_SENTRY_DSN) {
    return null;
  }
  if (!env.VITE_SENTRY_DSN) {
    return null;
  }
  if (!initialization) {
    initialization = import('@sentry/react')
      .then(
        ({
          init,
          captureException,
          tanstackRouterBrowserTracingIntegration,
          replayIntegration,
        }) => {
          init({
            dsn: env.VITE_SENTRY_DSN,
            environment: env.VITE_ENV,
            release: `${import.meta.env.VITE_APP_NAME ?? 'app'}@${env.VITE_APP_VERSION}`,
            sendDefaultPii: false,
            integrations: [
              ...(router
                ? [tanstackRouterBrowserTracingIntegration(router)]
                : []),
              replayIntegration({ maskAllText: true, blockAllMedia: true }),
            ],
            tracesSampleRate: env.VITE_ENV === 'production' ? 0.1 : 1,
            replaysSessionSampleRate: 0,
            replaysOnErrorSampleRate: 1,
            beforeSend(event) {
              if (event.request?.headers) {
                delete event.request.headers.Authorization;
                delete event.request.headers.authorization;
              }
              return event;
            },
          });
          return { captureException };
        },
      )
      .catch((error: unknown) => {
        initialization = null;
        throw error;
      });
  }
  return await initialization;
}

export async function reportError(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  await initSentry()
    .then((reporter) => {
      reporter?.captureException(
        error,
        context ? { extra: context } : undefined,
      );
    })
    .catch(() => null);
}
