# Route templates (TanStack Start)

Starting points. Names are examples (`products`, `$slug`); keep the shape,
rename the domain. Verified against `@tanstack/react-start` 1.169,
`@tanstack/react-router` 1.170, `@tanstack/react-query` 5.107. Run the
typecheck after copying — signatures move between minor versions.

## `src/shared/lib/router/router-context.ts`

```ts
import type { QueryClient } from '@tanstack/react-query'
import type { i18n as I18n } from 'i18next'

export interface RouterContext {
  queryClient: QueryClient
  i18n: I18n
}
```

Kept in `shared/` so feature loaders can type their context without
importing from `src/routes/`.

## `src/router.tsx` (once per project)

```tsx
import { MutationCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import NotFoundContainer from '@/features/fallback/not-found'
import RouteErrorContainer from '@/features/fallback/route-error'
import { notifyMutationError, notifyMutationSuccess } from '@/shared/api/mutation-feedback'
import { createI18n } from '@/shared/lib/i18n/create-i18n'
import { getInitialLanguage } from '@/shared/lib/i18n/get-initial-language'

import { routeTree } from './routeTree.gen'

// A new router, QueryClient and i18n per call: Start calls this once per SSR
// request, so nothing one visitor loads can reach another visitor's HTML.
export function getRouter() {
  const i18n = createI18n(getInitialLanguage())
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) =>
        notifyMutationSuccess(mutation.meta, i18n),
      onError: (error, _variables, _context, mutation) =>
        notifyMutationError(error, mutation.meta, i18n),
    }),
  })

  const router = createRouter({
    routeTree,
    context: { queryClient, i18n },
    scrollRestoration: true,
    defaultPreload: 'intent',
    // Query decides freshness, not the router cache.
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: RouteErrorContainer,
    defaultNotFoundComponent: NotFoundContainer,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
```

`getInitialLanguage` is a `createIsomorphicFn()`: `.server()` reads the
language cookie with `getCookie` (from `@tanstack/react-start/server`) and
falls back to the default; `.client()` reads `document.documentElement.lang`
(already right from the server). Mutations only run in the browser, so the
toasts in `MutationCache` never run during SSR.

## `src/routes/__root.tsx`

```tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import NotFoundContainer from '@/features/fallback/not-found'
import { RootDocument } from '@/shared/layout/root/root-document'
import type { RouterContext } from '@/shared/lib/router/router-context'
import { rootHead } from '@/shared/lib/seo/root-head'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => rootHead(),
  shellComponent: RootDocument,
  component: Outlet,
  notFoundComponent: NotFoundContainer,
})
```

`RootDocument` (`src/shared/layout/root/root-document.tsx`):

```tsx
export function RootDocument({ children }: { children: ReactNode }) {
  const { i18n } = useRouteContext({ from: '__root__' })
  return (
    <I18nextProvider i18n={i18n}>
      <RootHtml>{children}</RootHtml>
    </I18nextProvider>
  )
}

function RootHtml({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  return (
    // suppressHydrationWarning: the theme script sets the class before hydration.
    <html lang={i18n.language} dir={i18n.dir(i18n.language)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce children={themeScript} />
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
```

`rootHead()` returns charset, viewport, theme-color, icons, manifest, the
font preload and `og:site_name`. **No canonical here** (links are not
de-duplicated across nested routes).

## Page route `src/routes/_site/products/$slug.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'

import ProductDetailContainer from '@/features/website/products/pages/detail'
import { ProductDetailSkeleton } from '@/features/website/products/pages/detail/components/product-detail-skeleton'
import { productDetailHead } from '@/features/website/products/pages/detail/product-detail-head'
import { loadProductDetailPage } from '@/features/website/products/pages/detail/load-product-detail-page'

export const Route = createFileRoute('/_site/products/$slug')({
  loader: ({ context, params }) => loadProductDetailPage(context, params.slug),
  head: ({ loaderData, match }) => productDetailHead(loaderData, match.context.i18n),
  component: ProductDetailContainer,
  pendingComponent: ProductDetailSkeleton,
})
```

## Loader function `load-product-detail-page.ts`

```ts
import { redirect } from '@tanstack/react-router'

import { notFoundOn404 } from '@/shared/api/not-found'
import type { RouterContext } from '@/shared/lib/router/router-context'

import { productQueryOptions, relatedProductsQueryOptions } from '../../queries/product.queries'
import { toProductSeo } from './utils/to-product-seo'

export async function loadProductDetailPage({ queryClient }: RouterContext, slug: string) {
  const product = await queryClient.query(productQueryOptions(slug)).catch(notFoundOn404)

  if (product.slug !== slug) {
    throw redirect({ to: '/products/$slug', params: { slug: product.slug }, statusCode: 301 })
  }

  // Below the fold: stream it, never let its failure fail the page.
  void queryClient.query(relatedProductsQueryOptions(product.id)).catch(() => undefined)

  return { seo: toProductSeo(product) }
}
```

`notFoundOn404` (`src/shared/api/not-found.ts`):

```ts
import { notFound } from '@tanstack/react-router'

import { getErrorStatus } from './errors'

export function notFoundOn404(error: unknown): never {
  if (getErrorStatus(error) === 404) throw notFound()
  throw error
}
```

## Search params

```tsx
const searchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).catch('newest'),
})

export const Route = createFileRoute('/_site/products/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ context, deps }) => loadProductsPage(context, deps),
  head: ({ loaderData, match }) => productsHead(loaderData, match.context.i18n),
  component: ProductsContainer,
})
```

## Guard layout `src/routes/_account.tsx`

```tsx
export const Route = createFileRoute('/_account')({
  beforeLoad: async ({ location }) => {
    const session = await getSession() // server function, reads the HttpOnly cookie
    if (!session) throw redirect({ to: '/login', search: { redirect: location.href } })
    return { session }
  },
  headers: () => ({ 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' }),
  head: () => ({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] }),
  component: AccountLayout,
})
```

## Page hook

```ts
const route = getRouteApi('/_site/products/$slug')

export function useProductDetailPage() {
  const { slug } = route.useParams()
  const { data: product } = useSuspenseQuery(productQueryOptions(slug))
  // derived values, local UI state, callbacks …
  return { product /* … */ }
}
```

Streamed section:

```tsx
<Suspense fallback={<RelatedProductsSkeleton />}>
  <RelatedProducts productId={page.product.id} />
</Suspense>
```

## Test harness `src/test/render-route.tsx`

Renders a container inside a small router whose route ids match the real
ones, so `getRouteApi(...)` resolves. The real tree is not used because its
`shellComponent` renders `<html>`.

```tsx
export async function renderRoute(options: {
  url: string
  layoutId: string            // e.g. '_site'
  path: string                // e.g. 'products/$slug'
  loader?: (ctx: { context: RouterContext; params: Record<string, string> }) => Promise<unknown>
  component: () => ReactNode
}) {
  const queryClient = createTestQueryClient()
  const i18n = createTestI18n()
  const root = createRootRouteWithContext<RouterContext>()({ component: Outlet })
  const layout = createRoute({ getParentRoute: () => root, id: options.layoutId, component: Outlet })
  const page = createRoute({
    getParentRoute: () => layout,
    path: options.path,
    loader: options.loader,
    component: options.component,
  })
  const router = createRouter({
    routeTree: root.addChildren([layout.addChildren([page])]),
    history: createMemoryHistory({ initialEntries: [options.url] }),
    context: { queryClient, i18n },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>,
  )
  await router.load()
  return { ...view, router, queryClient, user: userEvent.setup() }
}
```

Assert states with MSW handlers (`ok`, `fail`), and navigation with
`router.state.location.pathname`. Status codes and head tags are asserted
in e2e against the built server, not here.
