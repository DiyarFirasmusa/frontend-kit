---
paths:
  - "src/lib/monitoring.ts"
  - "src/main.tsx"
  - "src/router.tsx"
  - "src/routes/__root.tsx"
  - "src/routes/**/route.tsx"
  - "src/features/fallback/**"
  - "src/api/core/interceptors.ts"
  - "vite.config.ts"
  - "src/shared/lib/monitoring.ts"
  - "src/shared/api/clients/**"
  - "src/api/client/**"
---

# Error monitoring (Sentry)

> Paths below are the default layout. A project with `.claude/rules/structure.md` (the Next.js and TanStack Start variants)
> reads them through that file's path map (`src/shared/…`, `layouts/`, `api/client/`, …).

Sentry tells us what broke in production without telling anyone who the user
is. All of it lives in `src/lib/monitoring.ts`; nothing else imports `@sentry/react`.

## Setup

- Initialise only when `VITE_SENTRY_DSN` is set; local dev and tests run without it.
- Load the SDK lazily (`import('@sentry/react')`) so it stays out of the first chunk.
- `environment` from the env (`production`, `uat`, `development`).
- `release` = `<app-name>@<version or commit sha>`, the same string the build
  uses to upload source maps, so stack traces resolve.
- Router tracing through `tanstackRouterBrowserTracingIntegration(router)` so
  transactions are named by route (`/users/$userId`), not by raw URL.
- `tracesSampleRate` low in production (around 0.1); replays only on error.

## No PII

- Sentry 11 collects local variable values in stack frames by default (`stackFrameVariables: true`). On server runtimes those
  values are user data: set `stackFrameVariables: false` there.
- No default PII: on `@sentry/react` 11 set
  `dataCollection: { userInfo: false, cookies: false, httpHeaders: false, urlQueryParams: false, httpBodies: [] }`
  (`sendDefaultPii: false` on 10 and older). Never call `setUser` with a name, email or phone;
  an opaque user id at most, and only if the project allows it.
- `beforeSend` removes `Authorization` and `Cookie` headers, and strips query
  strings that can carry personal data (`?q=` search text, tokens).
- Replay: `maskAllText: true`, `blockAllMedia: true`, inputs masked.
- Breadcrumbs: no request or response bodies, no form values.
- `extra` context holds ids and states (`{ entity: 'users', action: 'delete', id }`),
  never the record itself.

## What gets reported

| Error                                          | Reported? |
| ---------------------------------------------- | --------- |
| Render / loader error caught by a boundary     | yes       |
| Unhandled rejection, unexpected exception      | yes       |
| API 5xx and network failures                   | yes, as a breadcrumb + event with status and endpoint (no body) |
| API 4xx (validation, 403, 404, 409)            | no — expected, the user already sees it |
| Cancelled requests                             | no        |

Handled errors that matter go through `reportError(error, context)` from
`src/lib/monitoring.ts`, never `console.error` (production builds drop console).

## Boundaries

- `createRoot` takes `onCaughtError` and `onUncaughtError` (React 19): render errors are not rethrown, so those two options
  are where they reach `reportError`.
- The root route's `errorComponent` renders the standalone error page with
  reload + home; `_app/route.tsx` has its own `errorComponent` so a crashed
  page keeps the sidebar and top bar.
- Both report through `reportError` once (no double reporting from `onError`
  and the component).
- `notFoundComponent` is not an error; do not report 404s.
- The error UI shows a short reference (event id) the user can send to
  support, translated in both languages, never the stack.

## Source maps

- Built as hidden source maps and uploaded by the Sentry Vite plugin only when
  `SENTRY_AUTH_TOKEN` is set at build time; then deleted from the output so
  they are never served.
- Never commit the auth token or the DSN for production into the repo.

## Tests

- `beforeSend` scrubbing is unit-tested with a fake event.
- Monitoring is a no-op in tests (no DSN); assert `reportError` is called with
  a mock where reporting is part of the behaviour.
