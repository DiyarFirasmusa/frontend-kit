---
paths:
  - 'src/content/**'
  - 'src/features/website/news/**'
  - 'src/routes/$locale/news/**'
  - 'src/shared/lib/seo/site.ts'
  - 'src/config/canonical-site.ts'
  - 'src/shared/server/security-headers.ts'
---

# Content (articles), slugs

- Two layers. Interface text (menus, buttons, page copy) is i18n JSON in `locales/<language>.json`. Editable content
  that grows (articles) lives in `src/content/` and is read only through its async API in `src/content/articles.ts`:
  `listArticles(locale)`, `getArticle(slug, locale)`, `listArticleEntries()`. Pages, loaders and the sitemap never
  import `articles.data.ts` or `bodies/`. The e2e fixture is the one exception: it needs a real slug at load time.
- The route loader returns the article in the page language (`{ article, related }`); `head()` and the component read
  the same `loaderData`. A missing article is `throw notFound()` in the loader (a real 404), never a text with a 200.
- The demo data is `articles.data.ts` (titles, dates: small, in the browser's entry script because lists and cards need
  them) and `bodies/<slug>.ts` (the paragraphs: one chunk per article, loaded when the article opens, so text never
  weighs on the entry script). To add an article: one entry in `articles.data.ts`, one file in `bodies/` with the same
  slug (`articles.test.ts` fails on a missing or orphaned file).
- To use a CMS or an API, replace the bodies of those three functions and keep their types (`src/content/types.ts`).
  A fetch that needs a secret goes in a `createServerFn` handler, not in the browser path. `deploy/nginx/site.conf`
  rate-limits `/_serverFn/` for the contact form (10 requests a minute): a server function used for navigation needs
  its own limit there.
- Slug policy: **lowercase ASCII kebab-case** (`plan-your-first-quarter`), the same in every language, stable once
  published. The demo tests enforce it. The stored spelling is the canonical one: `canonicalUrl`, the sitemap and the
  redirects all print it (non-ASCII letters encoded with uppercase hex). The server answers a URL in a different
  spelling in one of two ways, never a chain: when the page exists (`resolveArticleSlug`, case-insensitive, decoded)
  it is **one 301** to the stored spelling (`/EN/NEWS/PLAN-YOUR-FIRST-QUARTER/` goes straight to
  `/en/news/plan-your-first-quarter`); when no article has the slug it is a **direct 404** with no redirect in front
  of it. `getArticle` itself matches the slug exactly. A CMS with mixed-case or Arabic slugs works the same: make
  `resolveArticleSlug` return the stored spelling (an exact match wins over a case-insensitive one) and answer it
  from a cache, because it runs once per article URL request. A new kind of slug page needs one line in
  `src/config/canonical-site.ts` (`routing-head.test.ts` fails without it).
- Every article has a title, summary, cover alt and paragraphs in every language (`LOCALES`): the types make a missing
  language a compile error. Paragraphs of one article are unique (they are React keys).
