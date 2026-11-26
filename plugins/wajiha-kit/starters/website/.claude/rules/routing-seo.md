---
paths:
  - 'src/routes/**'
  - 'src/router.tsx'
  - 'src/start.ts'
  - 'src/config/**'
  - 'src/features/website/**/*-head.ts'
  - 'src/routing.test.ts'
  - 'src/routing-head.test.ts'
  - 'src/test/load-route.ts'
  - 'src/shared/server/canonical-redirect*.ts'
  - 'scripts/generate-routes.*'
  - 'src/shared/lib/seo/**'
  - 'src/shared/components/locale-layout.tsx'
---

# Routing, rendering, SEO

- Route files are thin: the path, `head()`, `loader`, the component import. UI and logic live in `src/features/website`.
  `src/routeTree.gen.ts` is generated: never edit it; `npm run routes` regenerates it after you add or
  rename a route file and exits (`npm run dev` also does, but it never exits). Then `npm run fmt`.
- The language is the first URL segment. Public pages are children of `src/routes/$locale.tsx`, whose `params.parse`
  returns false for an unknown language (the route does not match, so `params.locale` is a `Locale` everywhere
  below it), which sets the request's i18n language and draws the header and footer (`LocaleLayout`).
  `src/routes/index.tsx` ("/") only redirects (302, `Vary`, `no-store`) to the saved `lang` cookie, then the browser
  language, then Arabic.
- Everything renders on the server. Title, description, canonical, hreflang, Open Graph and JSON-LD come from `head()`
  through `seo()` (a plain page: `pageHead(params.locale, '/$locale/<page>')` in `src/shared/lib/seo/page-head.ts`,
  fed by its `NAV` entry; home and the article have their own `*-head.ts`); no component writes `<title>` or `<meta>`
  (the root document's `ThemeColorMeta` is the exception: the router keeps one meta per `name`, so the light and the
  dark `theme-color` cannot both go in `head()`; `routing-head.test.ts` and `e2e/raw/seo.spec.ts` check them). `seo()` is set on the leaf route only (link tags
  from nested routes are not de-duplicated).
- Failures are real status codes: an unknown language or page, and an unknown article (the loader throws
  `notFound()`), answer 404; a thrown error answers 500. An unmatched URL is caught by the splat routes
  (`src/routes/$.tsx`, `src/routes/$locale/$.tsx`), which throw `notFound()`, so every failure carries the public
  match `status`. `__root.tsx` reads it (`failureOf` in `src/shared/lib/seo/failed-page.ts`; never a private router
  field), marks the page `noindex` and gives it a title; `X-Robots-Tag` repeats that. `src/routing.test.ts` loads the
  real route tree and proves it. Do not add a route under `src/routes` that would swallow these URLs.
- `NAV` (`src/config/nav.config.ts`) is the one list behind the header, the footer and `sitemap.xml`: `to` is checked
  against the generated route types, so a typo fails `npm run typecheck`. A page that needs a parameter (the article)
  is not in `NAV`; its sitemap entries come from the content layer (`src/content/sitemap-entries.ts`). A `NAV` entry
  also holds the page's `metaTitleKey` and `metaDescriptionKey`, typed against the locale files. A page route with no
  `NAV` entry fails `npm run typecheck` (`navCoversEveryPage`; the error names the route) and
  `src/routing-head.test.ts`, which walks the real route tree and checks every public route's title, description,
  canonical and alternates: without them the router would swallow the error in `head()` and ship a 200 with no head.
- `VITE_ALLOW_INDEXING` is `true` only on the real site. Anything else sends `noindex` on every page and
  `Disallow: /` in `robots.txt`, so a staging copy is never indexed. `robots.txt` on the real site never Disallows a
  path (a blocked crawler never reads the `noindex`).
- The canonical spelling has no trailing slash and no repeated slash, a lowercase language prefix and lowercase static
  page segments (`PAGE_SEGMENTS`, from `NAV`), uppercase hex in percent-escapes, and a slug in its stored spelling.
  `canonicalRedirectIfExists` (`src/shared/server/canonical-redirect.ts`, fed by `src/config/canonical-site.ts`, called
  from `src/start.ts`) answers 301 (GET and HEAD only, one hop) **only when the canonical page exists**; a URL that
  names nothing gets no redirect and the router's direct 404, so a redirect never ends in a 404 (the structural rules
  alone are `canonicalPath` in `security-headers.ts`). The router's own trailing-slash redirect is off
  (`trailingSlash: 'preserve'` in `src/router.tsx`): it would send an unknown URL to another unknown one before its 404. Slugs: see `content.md`. Assets, files and server functions are never touched.
- Module top-level code must be SSR-safe: no `window` or `document` outside effects and handlers. No state at module
  level that differs per request (the router, the i18n instance and the nonce are made per request in `getRouter`).
- Internal links use `<Link to="/$locale/..." params={{ locale }}>`; the language switch is a plain `<a>`
  (`LanguageSwitcher`).
