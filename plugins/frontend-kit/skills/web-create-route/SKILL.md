---
name: web-create-route
description: "Website profile: add or change a page route in a TanStack Start site — the file route under src/routes, its loader (awaited vs streamed Query data), head() for title/description/canonical/share tags, notFound() with a real 404, 301 redirects for renamed slugs, errorComponent, pendingComponent, search-param validation, guards with beforeLoad, and the container wiring. Use when the user says new page, new route, add a URL, detail page, slug page, 404 for missing items, redirect old URLs, or a page loads data on the client that should be server-rendered."
---

# Create a route (TanStack Start)

Rules: `.claude/rules/routing-ssr.md`, `data-loading.md`, `seo-share.md`.
Templates: `references/route-templates.md` (copy, then rename).

## 0. Decide before writing

- **URL**: lowercase kebab-case, readable slug for items
  (`/products/$slug`), same path in both languages.
- **Layout**: under the public pathless layout (`_site/`) or a guarded one
  (`_account/`)? Guarded → `beforeLoad` already redirects; the page is `noindex`.
- **Indexable?** Public content → full `head()`. Private / utility → `noindex`.
- **First-HTML data**: what must be in the server HTML (main content, head
  data, existence)? That is awaited. Everything else streams.
- **Search params**: which ones, defaults, do they change the data?
- **Feature folder**: which `src/features/<group>/<feature>/` (or its
  `pages/<page>/`) owns the container. Create it first with
  `web-create-feature` if it does not exist.

## 1. Query options (feature `queries/`)

One `queryOptions` per read, key from `qk`, `staleTime` set. Add the key to
`src/shared/constants/query-keys.ts` and the endpoint to
`src/shared/constants/api.ts` if new.

## 2. Loader function (feature, not the route file)

`load-<page>-page.ts` beside the container:

1. `await queryClient.query(mainOptions)` (in parallel with any other
   awaited read). Convert a 404 with `notFoundOn404` → `notFound()`.
2. Renamed slug → `throw redirect({ to, params, statusCode: 301 })`.
3. Start streamed reads with `void queryClient.query(o).catch(() => undefined)`.
4. Return `{ seo }` — only what `head()` needs.

## 3. Head builder

`<page>-head.ts` beside the container: `seo({ … })` from the loader's `seo`
object, translated through the router context's i18n. Use the `web-seo-page`
skill for JSON-LD and share images.

## 4. Route file (thin)

```tsx
export const Route = createFileRoute('/_site/products/$slug')({
  loader: ({ context, params }) => loadProductPage(context, params.slug),
  head: ({ loaderData, match }) => productHead(loaderData, match.context.i18n),
  component: ProductDetailContainer,
  pendingComponent: ProductDetailSkeleton,
  notFoundComponent: ProductNotFound,
})
```

Add `validateSearch` (zod) + `loaderDeps` when search params change data;
`headers` for `private, no-store` / `X-Robots-Tag` on private pages.

## 5. Container + page hook

- `index.tsx`: JSX + one `use-<page>-page.ts` call.
- The page hook reads the route with `getRouteApi('<route id>')` and the
  data with `useSuspenseQuery(sameOptions)`; streamed sections sit in
  `<Suspense>` with a same-size skeleton.
- Every state designed: pending (skeleton of the final size), error (route
  `errorComponent` or inline for streamed sections), empty, success.

## 6. Links and crawl files

- Every entry point is a router `<Link to="/products/$slug" params={…}>`.
- Private path → `noindex`, not disallowed in `robots.txt` (that hides the `noindex`), never in the sitemap.
  Public listing/detail → sitemap route.
- Run the dev server once so `src/routeTree.gen.ts` regenerates; never edit it.

## 7. Tests

- Unit: the loader function (MSW): awaited data, `notFound` on 404, 301 on a
  renamed slug, streamed read not awaited. The head builder: title,
  description, canonical, robots, JSON-LD.
- Integration: container states with a memory-history router + MSW
  (`references/route-templates.md` → test harness).
- E2E on the built server: the HTML contains the tags before scripts; status
  404 for a missing slug; 301 + `Location` for an old slug; no hydration
  warnings in the console; Arabic and English, phone width.

## 8. Verify

`npm run typecheck && npm run lint:check && npm run test`, then
`npm run i18n:validate` if strings changed, `npm run test:e2e`,
`npm run build`. Say exactly what ran and what did not.
