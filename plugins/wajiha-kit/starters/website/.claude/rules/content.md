---
paths:
  - 'src/content/**'
  - 'src/features/website/news/**'
  - 'src/routes/$locale/news/**'
  - 'src/shared/lib/seo/site.ts'
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
  published. The demo tests enforce it. The server only changes the case of the language prefix and the static page
  segments of `NAV` (`canonicalRedirect`, `PAGE_SEGMENTS`) and the hex of percent-escapes; a slug segment is never
  lowercased or decoded, and `canonicalUrl` / `normalizePath` keep its case and encode non-ASCII letters with
  uppercase hex. So a CMS whose slugs are mixed case or Arabic works if the lookup compares the slug exactly as
  written (`/en/news/Q4-Plan` is looked up as `Q4-Plan`; `/en/news/q4-plan` is a different, missing page).
- Every article has a title, summary, cover alt and paragraphs in every language (`LOCALES`): the types make a missing
  language a compile error. Paragraphs of one article are unique (they are React keys).
