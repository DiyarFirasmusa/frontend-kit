---
name: web-create-feature
description: Website profile: scaffold a complete feature of a TanStack Start website from backend endpoints — endpoints, query keys, services or server functions, queryOptions, mutation hooks, page hook, container, file routes with loader and head(), locales in ar and en, and tests — in the project's feature-folder shape. Use when the user gives an endpoint or API doc and asks for a new page, section, catalogue, detail page, form flow or account screen, or says "new feature", "build this page from the API", "scaffold".
---

# Create a feature (TanStack Start website)

Follow the order; each step feeds the next. Read first:
`.claude/rules/routing-ssr.md`, `data-loading.md`, `api-layer.md`,
`seo-share.md`. Folder shapes: `references/feature-tree.md`.

## 0. Gather (ask only what the code and docs cannot answer)

- Group (`website`, `auth`, `account` under website) and feature folder
  name (= the URL segment, kebab-case, English).
- Endpoints and their real shapes (OpenAPI / generated types). Paging shape,
  optional fields, error codes. Missing field or endpoint → say so, offer
  `backend-request`; never fake data.
- Pages: main page only, detail, form, wizard steps?
- Public or private? Indexable or `noindex`? What must be in the first HTML?
- Does any call need a secret, the session cookie or a non-CORS backend? →
  server function (`web-server-fn`).

**Light path** (a near-static page with one request, e.g. a home page): skip the
service layer (call the client in `queryOptions` directly), keep the head builder
inline when it is under 15 lines, and write one locale pair. Everything else
(loader, `head()`, query key from `qk`, tests) stays. When a second feature needs
the call, promote its service **and** its queries to `src/shared/` together.

## 1. Constants

- `src/shared/constants/api.ts` → `endpoints.<domain>` (`list`, `detail: (slug) => …`).
- `src/shared/constants/query-keys.ts` → `qk.<domain> = { all, list(params), detail(slug) }`.

## 2. Feature folder `src/features/<group>/<feature>/`

1. `types/types.ts` — view models; backend types imported from the
   generated file, never redeclared.
2. `services/<entity>.service.ts` — client-safe calls on the shared client;
   or `server/<entity>.{schemas,functions,server}.ts` for server functions.
3. `queries/<entity>.queries.ts` — `queryOptions` per read, keys from `qk`,
   `staleTime` set per domain.
4. `hooks/query/use-<verb>-<entity>.ts` — mutations: `meta` for feedback,
   invalidate the `all` key in `onSuccess`, no toasts, no navigation.
5. `load-<feature>-page.ts` — the loader body (awaited vs streamed reads,
   `notFoundOn404`, 301 on renamed slug), returns `{ seo }`.
6. `<feature>-head.ts` — `seo({ … })` for the page (`web-seo-page`).
7. `use-<feature>-page.ts` — `getRouteApi(id)`, `useSuspenseQuery`, local UI
   state, derived values, callbacks; returns one object.
8. `components/` — presentational pieces (props in, callbacks out; never
   fetch). Skeletons with the final size for every streamed section.
9. `index.tsx` — `export default function <Feature>Container()`: JSX + the
   page hook. Loading (skeleton), error, empty, success all designed.
10. `pages/<page>/` for every other screen, same shape (own loader, head,
    hook, container).
11. `validations/` — zod schemas with i18n-key messages if there is a form
    (shared `create-form` skill).
12. `locales/{ar,en}.json` — two-level keys, both languages, same change.

Used by a second feature? Promote then (services → `src/shared/services/`,
queries → `src/shared/queries/`, server functions → `src/shared/server/`),
not before.

## 3. Routes (thin)

- `src/routes/_site/<feature>/index.tsx` (main page) and
  `src/routes/_site/<feature>/$slug.tsx` (detail), each: `loader`, `head`,
  `component`, `pendingComponent`, plus `validateSearch` + `loaderDeps` for
  list filters. Private features go under the guard layout (`_account/`)
  with `noindex` and `private, no-store`.
- Run the dev server so `src/routeTree.gen.ts` regenerates. Never edit it.
- Use `web-create-route` for the details of each route.

## 4. Wire

- Navigation (header, footer, account menu) uses router `<Link>`s.
- Public pages → sitemap route + `e2e` a11y page list. Private → robots
  `Disallow`.
- Locale bundles registered the way the project does it (global vs
  feature bundle); `npm run i18n:validate`.

## 5. Tests (shared `testing` rule)

- Unit: utils, schemas, `to<X>Seo`, the head builder, the loader function
  (MSW: success, 404 → notFound, renamed slug → 301), the page hook.
- Integration: each container through the route test harness + MSW:
  pending, error, empty, success, one interaction, Arabic and English.
- E2E (built server): the flow, real HTML head tags, 404 status, no
  hydration warnings, phone width, both languages; axe on public pages.

## 6. Verify and report

```sh
npm run typecheck && npm run lint:check && npm run fmt:check && npm run test
npm run i18n:validate
npm run test:e2e
npm run build
```

Walk it on the dev server (mocks or UAT, never the live site) in Arabic and
English, phone and desktop, light and dark; view source of one public page.
Report in 3–6 lines; then ask before any commit.
