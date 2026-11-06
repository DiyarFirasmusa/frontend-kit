# Feature tree (TanStack Start website)

`src/routes/` decides URLs; `src/features/` owns everything a page renders
and loads. A route file imports from a feature; a feature never imports
from `src/routes/`.

## Project tree

```text
src/
├── router.tsx                     getRouter(): per-request QueryClient + i18n, defaults, SSR Query integration
├── start.ts                       optional createStart: request middleware
├── routeTree.gen.ts               generated
├── routes/
│   ├── __root.tsx                 shellComponent = RootDocument, root head, root notFound
│   ├── _site.tsx                  public layout (header, footer)
│   ├── _site/index.tsx            /
│   ├── _site/products/index.tsx   /products
│   ├── _site/products/$slug.tsx   /products/:slug
│   ├── _site/about.tsx            /about
│   ├── _auth.tsx                  auth layout (noindex)
│   ├── _auth/login.tsx            /login
│   ├── _account.tsx               guard: beforeLoad → redirect; private, no-store; noindex
│   ├── _account/account/index.tsx /account
│   ├── sitemap[.]xml.ts           server route
│   └── robots[.]txt.ts            server route
├── features/
│   ├── website/
│   │   ├── home/
│   │   ├── products/
│   │   │   └── pages/detail/
│   │   ├── about/
│   │   └── account/
│   │       └── pages/<screen>/
│   ├── auth/
│   │   └── login/
│   │       └── pages/verification/
│   └── fallback/
│       ├── not-found/             root + per-route notFoundComponent (noindex)
│       └── route-error/           defaultErrorComponent (retry = router.invalidate())
└── shared/
    ├── api/                       client, envelope, errors, not-found, mutation-feedback
    ├── server/                    server functions + *.server.ts used by 2+ features, env.server.ts
    ├── services/                  client-safe services used by 2+ features
    ├── queries/                   queryOptions used by 2+ features
    ├── layout/                    root-document, site header/footer, account shell
    ├── components/                ui/ primitives, composed/ pieces used by 2+ features
    ├── hooks/                     shared hooks; hooks/query/<domain>/ for shared mutations
    ├── store/                     Zustand (client UI state only, never server data)
    ├── lib/
    │   ├── i18n/                  create-i18n, languages, get-initial-language (isomorphic)
    │   ├── router/                router-context type
    │   └── seo/                   site, seo(), json-ld, root-head
    ├── constants/                 api.ts (endpoints), query-keys.ts (qk)
    ├── types/                     generated API types + shared types
    ├── utils/  locales/  style/  assets/
    └── env.ts                     zod-validated VITE_* (client-safe)
```

## One feature

```text
features/website/products/                 /products (main page)
├── index.tsx                              ProductsContainer: JSX + useProductsPage()
├── use-products-page.ts                   getRouteApi('/_site/products/'), queries, UI state
├── load-products-page.ts                  loader body
├── products-head.ts                       seo({ … })
├── index.test.tsx                         container states via renderRoute + MSW
├── components/
│   ├── product-tile.tsx                   <Link> tile, sized image, price row of fixed height
│   └── products-grid-skeleton.tsx
├── queries/
│   └── product.queries.ts                 productsQueryOptions(params), productQueryOptions(slug)
├── services/
│   └── product.service.ts                 fetchProducts, fetchProduct
├── hooks/query/                           mutations only (none for a read-only catalogue)
├── types/types.ts
├── utils/
│   └── to-product-seo.ts
├── locales/{ar,en}.json
└── pages/
    └── detail/                            /products/:slug
        ├── index.tsx
        ├── use-product-detail-page.ts
        ├── load-product-detail-page.ts
        ├── product-detail-head.ts
        └── components/
```

- Both pages need `productQueryOptions` → it lives at the feature root
  `queries/` (the deepest folder containing every importer).
- `pages/detail/` imports from `../../queries/` (up), never from a sibling
  page (sideways). Something two pages share moves up to the feature root.
- A loader or head builder longer than ~40 lines splits into `utils/`.

## Naming

| Kind | File | Export |
| ---- | ---- | ------ |
| Container | `index.tsx` | `export default function XContainer()` |
| Page hook | `use-x-page.ts` | `useXPage()` |
| Loader body | `load-x-page.ts` | `loadXPage(context, …)` |
| Head builder | `x-head.ts` | `xHead(loaderData, i18n)` |
| Query options | `queries/<entity>.queries.ts` | `xQueryOptions(…)` |
| Mutation hook | `hooks/query/use-<verb>-<entity>.ts` | `useVerbEntity()` |
| Service | `services/<entity>.service.ts` | `fetchX`, `createX` |
| Server function | `server/<entity>.functions.ts` | `getX`, `submitX` |
| Server-only | `server/<entity>.server.ts` | plain functions |
| Schema | `validations/validations.ts` or `server/<entity>.schemas.ts` | `xSchema`, `XInput` |
