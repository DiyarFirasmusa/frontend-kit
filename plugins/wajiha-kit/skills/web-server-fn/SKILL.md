---
name: web-server-fn
description: Website profile - create or change a TanStack Start server function (createServerFn) - zod-validated input, GET reads and POST writes, secrets and HttpOnly cookies server-only, authorisation, safe errors. Use for server function, createServerFn, hiding an API key, session cookie.
---

# Server function (TanStack Start)

Rules: `.claude/rules/data-loading.md` (server functions), `api-layer.md`.
Templates: `references/server-fn-templates.md`.

## 0. Is a server function the right tool?

Use one when the call needs a **secret**, a **server-only SDK**, the
**HttpOnly session cookie**, or a backend the browser **cannot reach**
(CORS, private network). A plain public read from a CORS-enabled API stays a
normal service + `queryOptions`. A raw HTTP endpoint for third parties
(webhook, feed, sitemap) is a **server route** (`server.handlers`), not a
server function.

## 1. Files

In the owning feature (or `src/shared/server/` once 2+ features use it):

```
features/<group>/<feature>/server/
├── <entity>.schemas.ts     zod schemas + inferred types (client-safe)
├── <entity>.functions.ts   createServerFn wrappers (safe to import anywhere)
└── <entity>.server.ts      server-only helpers: backend calls with secrets, cookie reads
```

- Import `.functions.ts` statically, also from components; the build swaps
  the body for an RPC call. Never `await import()` it.
- `.server.ts` is imported only from handlers (or other `.server.ts`).
- Server-only env: `serverEnv()` from `src/shared/server/env.server.ts`,
  read inside the handler (edge runtimes have no env at module load).

## 2. Write it

1. **Schema** in `<entity>.schemas.ts`: every field bounded (`max`, `int`,
   enums). Error messages are i18n keys, as in forms.
2. **Method**: `GET` for reads (cacheable, used as `queryFn`), `POST` for
   anything that changes state.
3. **Validate**: `.validator(schema)`; the handler uses only `data`.
   (Older Start versions named it `inputValidator`; follow the installed
   version's types.)
4. **Authorise** in the handler (or a shared `createMiddleware`): who is
   calling, may they touch **this** resource. A server function is a public
   HTTP endpoint.
5. **Call** the backend through the `.server.ts` helper. Map backend errors
   to safe results: `throw notFound()` when the page should 404,
   `throw redirect()` when it should move, return `{ ok: false, … }`
   (`api-layer.md`) for an expected failure the UI handles, and throw an `Error`
   with a translatable key for the rest — never the raw backend body, stack or
   token. A URL built from input follows the SSRF line of `security.md`.
6. **Headers**: personalised result → `setResponseHeaders(new Headers({
   'Cache-Control': 'private, no-store' }))`.
7. **Return** plain serialisable data shaped for the UI.

## 3. Use it

- Read: `queryOptions({ queryKey: qk.x.detail(id), queryFn: () => getX({ data: { id } }) })`,
  awaited in the loader, `useSuspenseQuery` in the page hook.
- Write: in `hooks/query/use-save-x.ts`, `const save = useServerFn(saveX)`
  then `useMutation({ mutationFn: (input) => save({ data: input }), meta: { successMessage: 'x.saved' } })`;
  `onSuccess` returns
  `invalidateQueries({ queryKey: qk.x.all })`. The form submit is
  single-flight (`isPending` + a ref).
- Toasts come from the global `MutationCache` handlers; never `toast()` in
  the hook.

## 4. Tests

- Unit: the schema (valid, each invalid field) and the `.server.ts` logic
  with MSW for the backend and fixtures for the cookie/session.
- Authorisation: a guest and another user's resource are both rejected.
- Integration: the form or page through MSW, success + error + pending.
- E2E on the built server for the full path once (the RPC really runs).

## 5. Check before done

- No secret reachable from client code: `grep` the feature for
  `process.env` outside `*.server.ts` / handlers → none.
- `npm run build`, then search the client bundle (`dist`/output client
  assets) for the secret's variable name → none.
- typecheck, lint, tests, build ran; report what was not checked.
