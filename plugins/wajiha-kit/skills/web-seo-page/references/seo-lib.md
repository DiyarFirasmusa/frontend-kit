# SEO library (copy once per project)

Lives in `src/shared/lib/seo/`. Every file is unit-tested. No host is ever
hardcoded: `SITE_URL` comes from the validated env.

## `site.ts`

```ts
import { clientEnv } from '@/shared/env'

export const SITE_URL = clientEnv.VITE_SITE_URL.replace(/\/+$/, '')
export const SITE_NAME = clientEnv.VITE_SITE_NAME
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png` // 1200×630 in public/

// Canonical form: lowercase path, no trailing slash, no query or hash.
export function canonicalUrl(path: string): string {
  const pathname = path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  return `${SITE_URL}${pathname || '/'}`
}

export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export const OG_LOCALE = { ar: 'ar_AR', en: 'en_US' } as const satisfies Record<string, string>
```

## `seo.ts` — the only way pages produce head tags

```ts
type JsonLd = Record<string, unknown>

export interface SeoInput {
  title: string
  description?: string
  path?: string                 // canonical path; omit on noindex pages
  image?: string                // absolute or site-relative; change the URL when the image changes
  imageSize?: { width: number; height: number } // of `image`; defaults to the default card's
  type?: 'website' | 'product' | 'article'
  locale?: string               // i18n.language
  noindex?: boolean
  jsonLd?: JsonLd[]
}

export function seo(input: SeoInput) {
  const title = input.title === SITE_NAME ? SITE_NAME : `${input.title} | ${SITE_NAME}`
  const image = absoluteUrl(input.image ?? DEFAULT_OG_IMAGE)
  const url = input.path ? canonicalUrl(input.path) : undefined
  const ogLocale = input.locale === 'en' ? OG_LOCALE.en : OG_LOCALE.ar
  const imageSize = input.imageSize ?? (input.image ? undefined : { width: 1200, height: 630 })

  const meta = [
    { title },
    { name: 'robots', content: input.noindex ? 'noindex, nofollow' : 'index, follow' },
    ...(input.description ? [{ name: 'description', content: input.description }] : []),
    ...(input.noindex
      ? []
      : [
          { property: 'og:title', content: input.title },
          { property: 'og:type', content: input.type ?? 'website' },
          { property: 'og:image', content: image },
          ...(imageSize
            ? [
                { property: 'og:image:width', content: String(imageSize.width) },
                { property: 'og:image:height', content: String(imageSize.height) },
              ]
            : []),
          { property: 'og:locale', content: ogLocale },
          ...(url ? [{ property: 'og:url', content: url }] : []),
          ...(input.description ? [{ property: 'og:description', content: input.description }] : []),
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: input.title },
          { name: 'twitter:image', content: image },
          ...(input.description ? [{ name: 'twitter:description', content: input.description }] : []),
        ]),
  ]

  const links = url && !input.noindex ? [{ rel: 'canonical', href: url }] : []

  const scripts = input.noindex
    ? []
    : (input.jsonLd ?? []).map((data) => ({
        type: 'application/ld+json',
        // Escape "<" and the two line separators so a value can never close the script tag or break it.
        children: JSON.stringify(data)
          .replace(/</g, '\\u003c')
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029'),
      }))

  return { meta, links, scripts }
}
```

`og:site_name` is set once in `rootHead()` (`__root.tsx`). Nested `head()`
results de-duplicate `title` and `meta` (last wins) but **not** `links`, so
the canonical is emitted only by leaf page routes.

## `json-ld.ts`

```ts
const CONTEXT = 'https://schema.org'

export function organizationJsonLd(input: { logo: string; sameAs: string[] }) {
  return { '@context': CONTEXT, '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: absoluteUrl(input.logo), sameAs: input.sameAs }
}

export function websiteJsonLd() {
  // No SearchAction: Google retired the sitelinks search box.
  return { '@context': CONTEXT, '@type': 'WebSite', name: SITE_NAME, url: SITE_URL }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  }
}

export function productJsonLd(input: {
  name: string; description?: string; image: string; path: string
  sku?: string; brand?: string; price: number; currency: string; inStock: boolean
}) {
  return {
    '@context': CONTEXT,
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: [absoluteUrl(input.image)],
    sku: input.sku,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl(input.path),
      price: input.price.toFixed(2),
      priceCurrency: input.currency,          // ISO 4217
      availability: `${CONTEXT}/${input.inStock ? 'InStock' : 'OutOfStock'}`,
    },
  }
}

```

`JSON.stringify` drops `undefined` fields, so optional values disappear
cleanly.

## Sitemap route `src/routes/sitemap[.]xml.ts`

```ts
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const products = await listSitemapProducts() // server-only helper, public data
        const urls = [...STATIC_PUBLIC_PATHS, ...products.map((p) => p.path)]
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${escapeXml(canonicalUrl(path))}</loc></url>`).join('\n')}
</urlset>`
        return new Response(body, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
        })
      },
    },
  },
})
```

Only canonical, indexable URLs. Add `<lastmod>` only when the backend gives
a real modification date; no `priority` or `changefreq`. Over 50,000 URLs → a sitemap index.

## Robots route `src/routes/robots[.]txt.ts`

```ts
GET: () => {
  const indexable = serverEnv().SITE_INDEXABLE === 'true' // false on UAT and previews
  // Nothing is disallowed: a crawler blocked here would never read the noindex of a private or UAT page.
  const body = ['User-agent: *', 'Allow: /', ...(indexable ? ['', `Sitemap: ${SITE_URL}/sitemap.xml`] : [])].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
```

Where `SITE_INDEXABLE` is false every response also sends `X-Robots-Tag: noindex` (request middleware in
`src/start.ts`), and the host puts a login or an IP allow-list in front.

`PRIVATE_PATHS` (auth, cart, checkout, account) is one constant for the tests
that assert `noindex` and absence from the sitemap. Don't block AI crawlers unless the business asks.

## GEO (being quoted by AI answers)

- Content pages answer first: the first sentence answers the question
  directly; details after.
- Concrete facts over adjectives: prices, delivery times, payment methods,
  opening hours, contact.
- Structure: one `h2` per question, short paragraphs, lists, tables for
  comparisons.
- The same facts in Arabic and English.
