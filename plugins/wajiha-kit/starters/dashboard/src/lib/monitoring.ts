import type {
  Breadcrumb,
  captureException as captureSentryException,
  ErrorEvent,
} from '@sentry/react';
import type { AnyRouter } from '@tanstack/react-router';
import { env } from '@/env';

type CaptureException = typeof captureSentryException;
interface SentryReporter {
  captureException: CaptureException;
}

let router: AnyRouter | undefined;
let initialization: Promise<SentryReporter | null> | null = null;

/** Headers that carry credentials; compared lower-case. */
const SECRET_HEADERS = new Set(['authorization', 'cookie', 'set-cookie']);

/** Breadcrumb data fields that hold a URL (fetch/xhr `url`, navigation `from`/`to`). */
const URL_FIELDS = ['url', 'from', 'to'] as const;

/** Drops `?query` and `#hash`: search text and tokens travel there. */
export function stripQuery(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

/** Removes credentials and query strings from an event before it is sent. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const request = event.request;
  if (request) {
    if (request.headers) {
      for (const name of Object.keys(request.headers)) {
        if (SECRET_HEADERS.has(name.toLowerCase())) {
          delete request.headers[name];
        }
      }
    }
    delete request.cookies;
    delete request.query_string;
    if (request.url) {
      request.url = stripQuery(request.url);
    }
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  }
  return event;
}

/** Same rule for breadcrumbs: request and navigation URLs lose their query. */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const data = breadcrumb.data;
  if (!data) {
    return breadcrumb;
  }
  const cleaned: Record<string, unknown> = { ...data };
  for (const field of URL_FIELDS) {
    const value = cleaned[field];
    if (typeof value === 'string') {
      cleaned[field] = stripQuery(value);
    }
  }
  return { ...breadcrumb, data: cleaned };
}

export function configureMonitoring(appRouter: AnyRouter): void {
  router = appRouter;
}

/**
 * Called at boot (main.tsx). With a DSN the SDK loads right away (still a
 * separate chunk), so router tracing and replay-on-error cover the first
 * failure too. Without one nothing is loaded.
 */
export function startMonitoring(appRouter: AnyRouter): void {
  configureMonitoring(appRouter);
  if (env.VITE_SENTRY_DSN) {
    void initSentry().catch(() => null);
  }
}

export async function initSentry(): Promise<SentryReporter | null> {
  // A production build without a baked-in DSN never loads the SDK.
  if (import.meta.env.PROD && !import.meta.env.VITE_SENTRY_DSN) {
    return null;
  }
  if (!env.VITE_SENTRY_DSN) {
    return null;
  }
  initialization ??= import('@sentry/react')
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
          beforeSend: scrubEvent,
          beforeBreadcrumb: scrubBreadcrumb,
        });
        return { captureException };
      },
    )
    .catch((error: unknown) => {
      initialization = null;
      throw error;
    });
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
