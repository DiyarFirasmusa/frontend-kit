---
name: web-seo-page
description: Website profile - SEO and share previews for one TanStack Start page - head() title and description, canonical, Open Graph and Twitter tags (WhatsApp, Telegram previews), JSON-LD, noindex, robots, sitemap, hreflang. Use for SEO, meta tags, share preview, og:image, structured data, canonical.
---

# SEO for a page (TanStack Start)

Rules: `.claude/rules/seo-share.md`. Library code to copy once per project:
`references/seo-lib.md`. Server rendering means crawlers and chat apps read
exactly what `head()` returns in the first HTML; nothing set in an effect
reaches them.

## 0. Check the library exists

`src/shared/lib/seo/` should hold `site.ts` (`SITE_URL` from
`VITE_SITE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE`, `canonicalUrl`), `seo.ts`
(the `seo()` head builder) and `json-ld.ts` (typed builders). Missing →
create from `references/seo-lib.md` first, with tests.

## 1. Classify the page

| Page | head |
| ---- | ---- |
| Home | title, description, canonical `/`, `organizationJsonLd()` + `websiteJsonLd()` |
| Listing / category | title, description, canonical (filters collapse), `breadcrumbJsonLd` |
| Detail (product, article) | data-driven title/description/image, canonical from the item's slug, `productJsonLd` / `articleJsonLd` + `breadcrumbJsonLd`, `og:type` product/article |
| Content (about, FAQ, help) | title, description, canonical; visible Q&A without `FAQPage` (Google retired it) |
| Private (auth, cart, checkout, account) / fallback | `seo({ title, noindex: true })`, `X-Robots-Tag` in `headers()`; never disallowed in robots |

## 2. Make the data available on the server

- Everything `head()` uses comes from `loaderData` (or static locale keys).
  The loader **awaits** the read, then returns a small `seo` object
  (`toXSeo(item)` in the page's `utils/`): name, short description, image
  URL, canonical path, price/availability for products, breadcrumb trail.
- Never build head data from a query that only runs in the browser.

## 3. Write the head builder

`<page>-head.ts` beside the container:

```ts
export function productDetailHead(loaderData: ProductDetailLoaderData | undefined, i18n: I18n) {
  if (!loaderData) return seo({ title: i18n.t('products.metaTitle'), noindex: true })
  const { seo: page } = loaderData
  return seo({
    title: page.name,
    description: i18n.t('products.metaDescription', { name: page.name, price: page.priceLabel }),
    path: page.path,
    image: page.image,
    type: 'product',
    locale: i18n.language,
    jsonLd: [
      breadcrumbJsonLd(page.breadcrumbs),
      productJsonLd({ name: page.name, description: page.summary, image: page.image, path: page.path, sku: page.sku, price: page.price, currency: page.currency, inStock: page.inStock }),
    ],
  })
}
```

- Title ~50–60 chars (site name appended by `seo()`), description ~150,
  unique per page, both from the locale bundle in **ar** and **en**.
- Main keyword once in the title, the `<h1>`, the first paragraph and the
  main image `alt`. No stuffing.
- JSON-LD only states facts visible on the page. No invented ratings.

## 4. Slugs and redirects

- The canonical path is built from the item's own slug, never from the
  incoming URL.
- The loader 301-redirects an old slug / id URL to the current slug
  (`web-create-route`).
- No backend slug field? Say so and offer `backend-request`; don't derive
  unstable slugs silently.

## 5. Crawl files

- Public page → listed by the sitemap route (`src/routes/sitemap[.]xml.ts`).
- Private page → `noindex`, never in the sitemap, not disallowed in robots (a blocked crawler never reads `noindex`).
- UAT / preview environments: a login or IP allow-list (recommend, deploy owns it), plus `X-Robots-Tag: noindex`.
  `Disallow: /` does not keep a URL out of the index.
- A product sold on the page: price over 0, shipping and return policy when the backend has them.

## 6. Markup on the page

One `<h1>`; headings in order; tiles and cards are router `<Link>`s; link
text names the target; `alt` in the UI language; no text in images; LCP
image eager with `fetchPriority="high"`, others lazy, all sized.

## 7. Tests and checks

- Unit-test the head builder: title, description, canonical (absolute,
  lowercase, no trailing slash, no query), `robots`, `og:image` absolute,
  JSON-LD `@type`s, both languages.
- E2E on the built server: fetch the page HTML (no JS) and assert the tags;
  private pages carry `noindex`; a missing slug answers 404.
- Manual before release, on UAT: view source in ar and en, Rich Results
  Test, a share-preview debugger (Facebook Sharing Debugger, Telegram
  `@WebpageBot`). Report what was and was not checked.

More: `references/seo-lib.md` (builders, sitemap and robots routes, GEO tips).
