---
paths:
  - 'src/routes/**'
  - 'src/router.tsx'
  - 'src/start.ts'
  - 'src/config/**'
  - 'src/features/website/**/*-head.ts'
  - 'src/shared/lib/seo/**'
  - 'src/shared/components/locale-layout.tsx'
---

# Routing, rendering, SEO

- Route files are thin: the path, `head()`, `loader`, the component import. UI and logic live in `src/features/website`.
  `src/routeTree.gen.ts` is generated: never edit it; `npm run dev` or `npm run build` regenerates it after you add or
  rename a route file.
- The language is the first URL segment. Public pages are children of `src/routes/$locale.tsx`, which answers 404 for an
  unknown language (`notFound()`), sets the request's i18n language and draws the header and footer (`LocaleLayout`).
  `src/routes/index.tsx` ("/") only redirects (302, `Vary`, `no-store`) to the saved `lang` cookie, then the browser
  language, then Arabic.
- Everything renders on the server. Title, description, canonical, hreflang, Open Graph and JSON-LD come from `head()`
  through `seo()` (`<page>-head.ts`); no component writes `<title>` or `<meta>`. `seo()` is set on the leaf route only
  (link tags from nested routes are not de-duplicated).
- Failures are real status codes: an unknown language or page, and an unknown article (the loader throws
  `notFound()`), answer 404; a thrown error answers 500. `__root.tsx` marks them `noindex` and gives them a title;
  `X-Robots-Tag` repeats that.
- `NAV` (`src/config/nav.config.ts`) is the one list behind the header, the footer and `sitemap.xml`: `to` is checked
  against the generated route types, so a typo fails `npm run typecheck`. A page that needs a parameter (the article)
  is not in `NAV`; its sitemap entries come from `ARTICLES` in `src/shared/lib/seo/site-entries.ts`.
- `VITE_ALLOW_INDEXING` is `true` only on the real site. Anything else sends `noindex` on every page and
  `Disallow: /` in `robots.txt`, so a staging copy is never indexed. `robots.txt` on the real site never Disallows a
  path (a blocked crawler never reads the `noindex`).
- The canonical spelling is lowercase, no trailing slash, no repeated slash: `canonicalRedirect` (301, GET and HEAD
  only, one hop) in `src/shared/server/security-headers.ts`, called from `src/start.ts`. Assets, files and server
  functions keep their case.
- Module top-level code must be SSR-safe: no `window` or `document` outside effects and handlers. No state at module
  level that differs per request (the router, the i18n instance and the nonce are made per request in `getRouter`).
- Internal links use `<Link to="/$locale/..." params={{ locale }}>`; the language switch is a plain `<a>`
  (`LanguageSwitcher`).
