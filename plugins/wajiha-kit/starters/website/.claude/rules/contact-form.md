---
paths:
  - 'src/features/website/contact/**'
  - 'src/shared/utils/single-flight.ts'
  - 'src/shared/lib/zod.ts'
  - 'src/shared/server/env.server.ts'
  - 'src/shared/server/check-env-plugin.ts'
  - 'src/shared/env/**'
  - '.env.example'
  - 'scripts/e2e-server.mjs'
---

# Contact form, server functions, environment

- One flow: `contact-form.tsx` (markup) -> `use-contact-form.ts` (react-hook-form, single-flight, status) ->
  `submitContact` (`server/submit-contact.ts`, a TanStack Start server function) -> `deliverContact`
  (`server/deliver-contact.server.ts`, the webhook). Components never call `fetch`.
- The schema `validations/contact-schema.ts` is shared by the browser and the server: the browser check is for the
  visitor, the server check is the one that counts. Import `z` from `@/shared/lib/zod` (jitless: no eval under the
  CSP). Error messages are locale keys, translated where they are shown.
- The server function validates again and answers a plain `{ ok: false }` for bad input, never the details. It is
  same-origin only (CSRF middleware in `src/start.ts`) and capped at 16 KB (`MAX_SERVER_FN_BODY_BYTES`).
- The `<form>` has `method="post"` and its button stays disabled until hydration (`useHydrated`): an early submit must
  never put the message in the URL. After a send, focus moves to the success heading; after "send another", to the
  first field.
- The honeypot field is `contactRef`, named on purpose so browsers and password managers do not autofill it. A filled
  honeypot answers success and delivers nothing. Do not rename it to `website` or `url`.
- `deliverContact`: no `CONTACT_WEBHOOK_URL` means demo mode (accept, discard, warn in the log), but never on the real
  site (`VITE_ALLOW_INDEXING=true`): the server then refuses to start (`check-env-plugin.ts`) and delivery fails again.
  A failure is logged with the status or error code only: never the message, the visitor's details or the webhook URL.
  The webhook gets `{ name, email, phone, message }` as JSON and has an 8 s timeout; any 2xx counts as delivered.
- Environment: one schema (`src/shared/env/schema.ts`) checked at build time (`vite.config.ts`) and at server start. A
  bad value stops them with one message; there is no silent default for a typo. `VITE_SITE_URL` and
  `VITE_ALLOW_INDEXING` are the only browser values, read by hand in `public-env.ts` (no zod in the browser bundle).
  Server values are read per call with `getServerEnv()`, only in `*.server.ts` files and server functions.
  `.env.example` and the schema list the same keys (`npm run check:env`), and the example keeps
  `VITE_ALLOW_INDEXING=false`. `schema.ts` and what Nitro bundles at start use relative imports (no `@/` alias there).
- The e2e server (`scripts/e2e-server.mjs`) builds the site as the real site and runs a local webhook receiver that
  answers 500 for a message containing `e2e-webhook-fail`.
- A new server function: validate its input again on the server and return a small result. The body limit, the CSRF
  check and the no-store header in `src/start.ts` already cover every server function by path and handler type. Add a
  unit test and an e2e path.
