---
paths:
  - 'src/routes/**'
  - 'src/router.tsx'
  - 'src/start.ts'
  - 'src/config/**'
  - 'src/features/website/**/*-head.ts'
  - 'src/routing.test.ts'
  - 'src/shared/lib/seo/**'
  - 'src/shared/components/locale-layout.tsx'
---

# Routing, rendering, SEO

- Route files are thin: the path, `head()`, `loader`, the component import. UI and logic live in `src/features/website`.
  `src/routeTree.gen.ts` is generated: never edit it; `npm run dev` or `npm run build` regenerates it after you add or
  rename a route file.
- The language is the first URL segment. Public pages are children of `src/routes/$locale.tsx`, whose `params.parse`
  returns false for an unknown language (the route does not match, so `params.locale` is a `Locale` everywhere
  below it), which sets the request's i18n language and draws the header and footer (`LocaleLayout`).
  `src/routes/index.tsx` ("/") only redirects (302, `Vary`, `no-store`) to the saved `lang` cookie, then the browser
  language, then Arabic.
- Everything renders on the server. Title, description, canonical, hreflang, Open Graph and JSON-LD come from `head()`
  through `seo()` (a plain page: `pageHead(params.locale, '/$locale/<page>')` in `src/shared/lib/seo/page-head.ts`,
  fed by its `NAV` entry; home and the article have their own `*-head.ts`); no component writes `<title>` or `<meta>`. `seo()` is set on the leaf route only
  (link tags from nested routes are not de-duplicated).
- Failures are real status codes: an unknown language or page, and an unknown article (the loader throws
  `notFound()`), answer 404; a thrown error answers 500. An unmatched URL is caught by the splat routes
  (`src/routes/$.tsx`, `src/routes/$locale/$.tsx`), which throw `notFound()`, so every failure carries the public
  match `status`. `__root.tsx` reads it (`failureOf` in `src/shared/lib/seo/failed-page.ts`; never a private router
  field), marks the page `noindex` and gives it a title; `X-Robots-Tag` repeats that. `src/routing.test.ts` loads the
  real route tree and proves it. Do not add a route under `src/routes` that would swallow these URLs.
- `NAV` (`src/config/nav.config.ts`) is the one list behind the header, the footer and `sitemap.xml`: `to` is checked
  against the generated route types, so a typo fails `npm run typecheck`. A page that needs a parameter (the article)
  is not in `NAV`; its sitemap entries come from the content layer (`src/content/sitemap-entries.ts`). A `NAV` entry
  also holds the page's `metaTitleKey` and `metaDescriptionKey`, typed against the locale files.
- `VITE_ALLOW_INDEXING` is `true` only on the real site. Anything else sends `noindex` on every page and
  `Disallow: /` in `robots.txt`, so a staging copy is never indexed. `robots.txt` on the real site never Disallows a
  path (a blocked crawler never reads the `noindex`).
- The canonical spelling has no trailing slash and no repeated slash, a lowercase language prefix and lowercase static
  page segments (`PAGE_SEGMENTS`, from `NAV`), and uppercase hex in percent-escapes: `canonicalRedirect` (301, GET
  and HEAD only, one hop) in `src/shared/server/security-headers.ts`, called from `src/start.ts`. A slug segment keeps
  its case (see `content.md`); assets, files and server functions keep theirs too.
- Module top-level code must be SSR-safe: no `window` or `document` outside effects and handlers. No state at module
  level that differs per request (the router, the i18n instance and the nonce are made per request in `getRouter`).
- Internal links use `<Link to="/$locale/..." params={{ locale }}>`; the language switch is a plain `<a>`
  (`LanguageSwitcher`).
