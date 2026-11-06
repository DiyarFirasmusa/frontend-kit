---
paths:
  - "src/routes/**"
  - "src/features/**/index.tsx"
  - "src/features/**/seo/**"
  - "src/features/**/*-head.ts"
  - "src/shared/lib/seo/**"
  - "src/**/locales/*.json"
  - "public/robots.txt"
  - "public/sitemap*.xml"
---

# SEO and share previews

The site is server-rendered, so crawlers **and** chat apps (WhatsApp,
Telegram, Facebook, X, iMessage — none of them run JavaScript) see the real
title, description, image and JSON-LD in the first HTML. That only holds if
the tags come from the route's `head()`, fed by data the loader awaited.

## `head()` on every page route

```ts
head: ({ loaderData }) =>
  seo({
    title: loaderData.seo.title,          // site name appended by seo()
    description: loaderData.seo.description,
    path: loaderData.seo.path,            // canonical path, from the data
    image: loaderData.seo.image,          // absolute URL, ≥ 1200×630
    type: 'product',
    jsonLd: [productJsonLd(…), breadcrumbJsonLd(…)],
  })
```

- `src/shared/lib/seo/seo.ts` turns one object into `{ meta, links, scripts }`:
  `title`, `description`, `robots`, `og:title|description|url|image|type|
  site_name|locale`, `twitter:card` (`summary_large_image`), the canonical
  `<link>` and one `application/ld+json` script per entry.
- `site.ts` holds `SITE_URL` (from `VITE_SITE_URL`, never a hardcoded host),
  `SITE_NAME`, `DEFAULT_OG_IMAGE`, `canonicalUrl(path)` and the JSON-LD
  builders. Pages never build tags by hand.
- Nested `head()` results are merged: the last `title` and the last `meta`
  with the same `name`/`property` win. **Links are not de-duplicated**, so
  the canonical is set on the page (leaf) route only — never in `__root` or
  a layout.
- Every value comes from the locale bundle or the data. Dynamic pages build
  them from what the loader awaited; never `head()` from a query that only
  runs in the browser.
- Title: the page subject, then the site name (~50–60 chars). Description:
  one or two plain sentences, ~150 chars, with the main keyword. Unique per page.

## Canonical and URLs

- Canonical = `SITE_URL` + path: lowercase, no trailing slash, no query, no
  tracking params. Filters and sort collapse to the unfiltered canonical
  unless the filtered page is a real landing page.
- **Readable slugs** (`/products/wireless-headphones-x2`), built from the
  English name (or a transliteration), stable, unique. Prefer a backend
  `slug` field; when the backend has none, say so (`backend-request`)
  instead of guessing.
- A renamed slug or an old id URL answers **301** to the current slug:
  the loader compares `params.slug` with `product.slug` and throws
  `redirect({ to, params, statusCode: 301 })`.
- Links come from view models (`product.path`), never `/products/${id}`
  assembled in a component.
- Host-level rules (http → https, `www`, trailing slash, uppercase) belong
  to the hosting config; write the recommendation down, don't edit `deploy/`.

## Private pages

- `noindex, nofollow` through `seo({ noindex: true })` on: auth, cart,
  checkout, account and fallback (not found, error) pages.
- Also send `X-Robots-Tag: noindex` from the route's `headers()` on those
  paths, and keep them `Disallow`ed in `robots.txt`.
- Private pages get no JSON-LD and no share image.

## Structured data (JSON-LD)

- Home: `Organization` (name, url, logo, `sameAs` socials) + `WebSite`
  (no `SearchAction`; Google retired the sitelinks search box).
- Product detail: `Product` with `name`, `image`, `description`, `sku`,
  `brand`, `offers` (`price`, `priceCurrency`, `availability`, `url`).
  Only facts visible on the page; never invent ratings or reviews.
- Every page below home: `BreadcrumbList` matching the visible breadcrumb.
- FAQ content: `FAQPage` only when the questions are visible on the page.
- Serialise with `JSON.stringify` of typed builder output; never interpolate
  raw strings into the script.

## Share previews

- `og:image` is an absolute URL, 1200×630 (≥ 600×315), < 5 MB, JPEG/PNG/WebP,
  served without auth. Product pages use the product image or a generated
  card; others fall back to `DEFAULT_OG_IMAGE`.
- `og:url` equals the canonical. `og:locale` follows the page language
  (`ar_AR` / `en_US`); `og:site_name` is `SITE_NAME`.
- Check a page by fetching its HTML without JavaScript (`curl` the built
  server) and reading the `<head>` — that is exactly what the chat apps see.

## Markup

- One `<h1>` per page naming its subject; headings in order.
- Anything clickable that goes to another page is a router `<Link>` (a real
  `<a href>`), never a `div`/`button` calling `navigate()`.
- Link text names the target; icon-only links get an `aria-label`.
- Meaningful images have `alt` in the UI language; decorative ones `alt=""`.
  No text baked into images.

## Languages

- Default: one URL per page; the language is a cookie preference and the
  canonical points to that one URL with `hreflang="x-default"`. Crawlers get
  the default language. Because the HTML varies by cookie, it is never
  cached publicly without `Vary: Cookie`.
- Both languages indexed is a product decision: then each language gets its
  own URL (`/en/...`), each page emits `hreflang` alternates for both plus
  `x-default`, and the canonical is per language. Never fake `hreflang`
  for one shared URL.

## Crawl files

- `robots.txt`: allow public, `Disallow` private paths, `Sitemap:` line with
  the absolute sitemap URL. Static in `public/`, or a server route
  (`src/routes/robots[.]txt.ts`) when rules differ per environment — UAT and
  previews answer `Disallow: /`.
- Sitemap: a server route (`src/routes/sitemap[.]xml.ts`) that lists
  canonical, indexable URLs only (static pages + catalogue from the API),
  with `Content-Type: application/xml` and a cache header. A private path
  never appears in it.

## Checking

- Integration test: run the route's `head()` builder with fixture data and
  assert title, description, canonical, robots and the JSON-LD types.
- E2E on the built server: request the page HTML and assert the tags are in
  the response before any script runs; assert `404` status for a missing slug
  and `301` + `Location` for a renamed one.
- Before shipping a public page: view source in both languages, Rich Results
  Test on the JSON-LD, a share-preview debugger on UAT.
