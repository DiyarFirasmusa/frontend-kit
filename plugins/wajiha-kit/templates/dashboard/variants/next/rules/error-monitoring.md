---
paths:
  - "src/lib/monitoring.ts"
  - "src/instrumentation*.{js,ts}"
  - "instrumentation*.{js,ts}"
  - "src/app/**/{error,global-error}.tsx"
  - "app/**/{error,global-error}.tsx"
  - "src/app/layout.tsx"
  - "src/api/client/interceptors.ts"
  - "sentry.{server,edge}.config.{js,ts}"
  - "next.config.{js,mjs,cjs,ts,mts}"
---

# Error monitoring (Sentry on Next.js)

Sentry tells us what broke in production without telling anyone who the user is. Follow the `@sentry/nextjs` docs
for the installed major (the file names below are the ones its wizard creates); the rules here are what we add.

## Setup

- Use `@sentry/nextjs`; nothing else imports it except `src/lib/monitoring.ts` (a thin `captureError(error, context)`
  and `setUserContext(id)` wrapper) and the Sentry entry files.
- The three runtimes are initialised in `instrumentation-client.ts` (browser), and `instrumentation.ts` registering
  the server and edge configs. Each initialises only when its DSN is set (`NEXT_PUBLIC_SENTRY_DSN` for the browser,
  `SENTRY_DSN` for the server); local dev and tests run without it.
- `src/app/global-error.tsx` and `src/app/error.tsx` call `captureError` and render the shared error view with a retry:
  the `retry` prop (16.3+; `reset` only clears the state), with `QueryErrorResetBoundary` around a failed query.
- Server errors: `export const onRequestError = Sentry.captureRequestError` in `instrumentation.ts`.
- `environment` from the env (`production`, `uat`, `development`); `release` = `<app-name>@<version or commit sha>`,
  the same string the build uses to upload source maps.
- `tracesSampleRate` low in production (around 0.1); replays only on error.
- Source maps: `withSentryConfig` (from `@sentry/nextjs/config` on 11) in `next.config.*`, uploaded only when
  `SENTRY_AUTH_TOKEN` is present in CI; the token is never in the repo and never `NEXT_PUBLIC_`.

## No PII

Same as every dashboard: in all three inits `dataCollection` with `userInfo`, `cookies`, `httpHeaders` and `urlQueryParams`
set to `false` and `httpBodies: []`, and in the server and edge inits also `stackFrameVariables: false` (by default they
send local variables). On `@sentry/nextjs` 10 and older `sendDefaultPii: false`. A `beforeSend` drops request bodies, cookies, auth headers and
query strings with personal data; only the user id (never email or name) goes in `setUser`. The API clients scrub
before they capture (`interceptors.ts`).

## What is reported

- Unexpected errors, once, at the boundary that catches them (`error.tsx`, `global-error.tsx`, the API client's
  non-handled branch). A 401 / 403 / validation error from the backend is a normal outcome, not an incident.
- A tunnel route (`tunnelRoute`, deprecated) is not added. An existing one is a fixed string **excluded** from the proxy
  matcher, or the auth redirect swallows every event.

## Don't

- No `Sentry.captureException` scattered through features; go through `captureError`.
- No DSN or token in a committed file. No `console.error` as the reporting mechanism.
