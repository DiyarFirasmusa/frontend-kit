---
paths:
  - "app/**/*.{js,jsx,ts,tsx,mdx}"
  - "src/app/**/*.{js,jsx,ts,tsx,mdx}"
  - "proxy.{js,ts}"
  - "src/proxy.{js,ts}"
  - "middleware.{js,ts}"
  - "src/middleware.{js,ts}"
  - "instrumentation*.{js,ts}"
  - "src/instrumentation*.{js,ts}"
  - "next.config.{js,mjs,cjs,ts,mts}"
  - "**/actions.{js,ts}"
---

# Next.js (App Router)

Loads only in projects that depend on `next`. Version floors are Next 16 unless a line says otherwise.

- `page.tsx` and `layout.tsx` default-export a thin component. A container that uses state, effects or a browser-held
  session is `'use client'` (`routing.md` in the Next variant says more).
- `params` and `searchParams` are Promises in Server Components: `await` them. Client Components read them with
  `useParams()` and `useSearchParams()`.
- `proxy.ts` (Next 16; `middleware.ts` before) runs before matched requests. It is optimistic: a cookie check and a redirect.
  Its `matcher` excludes `_next/static`, `_next/image`, the favicon and `/api`. A cookie check is not a permission check.
- `'use server'` functions and route handlers are public HTTP endpoints. Validate input with zod, authorise inside, return
  failures as data (`shared/rules/security.md`).
- Cache Components (`cacheComponents` in `next.config`): reading runtime data (`cookies()`, `headers()`, `searchParams`)
  outside `<Suspense>` fails the build. Wrap the part that reads it.
- `error.tsx` is a `'use client'` module with a default export. It receives `reset`; Next 16.3+ also passes `retry`, which new
  code uses.
- `useSearchParams()` needs a `<Suspense>` above it on a prerendered route, or the production build fails.
- Route types are generated: the typecheck is `next typegen && tsc --noEmit`, not `tsc --noEmit` alone.
- A page that calls `notFound()` after its first streamed byte still answers 200. Mark such pages `noindex` and say so.
- Keep `next` on the latest patch of its line (`shared/rules/dependencies.md` lists the fixed versions).
