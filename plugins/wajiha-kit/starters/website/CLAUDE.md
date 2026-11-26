# CLAUDE.md

A public company website, server-rendered, no admin and no database. Arabic (RTL) is the default language, English
(LTR) is equal; the language is the first URL segment (`/ar/...`, `/en/...`). The only write path is the contact
form, a server function that posts to a webhook. The long guide for people is `STRUCTURE.md` (Arabic). This file is
the short version for you. The demo company is fictional: replace it, never invent a real name.

Stack: React 19, TanStack Start + Router (file routes, Nitro server), TypeScript strict, Tailwind v4 with one token
file, i18next (one instance per request, in the router context, typed keys), react-hook-form + zod 4 (contact form
only). No state library: the theme is the `data-theme` attribute, the phone menu is `useState`. Tests: Vitest +
Testing Library, Playwright + axe. oxlint, oxfmt, husky, commitlint. Package manager: npm. Node 24+ (`.nvmrc`, `engines`, `engine-strict`).
No TanStack Query, axios, MSW or Base UI: the content is static and the form is one server function.

Rules live in `.claude/rules/` and load by path: `routing-seo`, `i18n-rtl`, `content`, `styles-tokens`,
`contact-form`, `security-headers`, `testing`.

## Hard rules

- No user-facing string in code: `t('group.key')`, every language (`LOCALES`) in the same change. Keys are typed: a
  typo fails `npm run typecheck`.
- Logical CSS only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`): no `ml-`, `mr-`, `left`, `right`.
- Colours and fonts come from `src/shared/style/tokens.css` utilities (`bg-surface`, `text-muted`, `text-primary`).
  No hex, no inline `style=`. A block filled with the brand colour uses `surface-primary`, not `bg-primary`.
- No `<title>` or `<meta>` in components: every page declares them in `head()` through `seo()`.
- Images go through `Picture` (width, height and alt are required). An article or page that is missing throws
  `notFound()` (a real 404), never a "not found" text with a 200.
- The CSP is strict (`style-src 'self'`, no inline script without the request nonce, no eval): no library that injects
  styles, no inline `style=`, no third-party host that is not listed in `THIRD_PARTY`
  (`src/shared/server/security-headers.ts`). Import `z` from `@/shared/lib/zod`, never from `'zod'` (lint enforces it;
  zod's own fast path would use eval).
- A new env value goes into `src/shared/env/schema.ts` and `.env.example` together. `VITE_*` reaches the browser:
  never a secret. `public-env.ts` reads the two browser values by hand on purpose (no zod in the browser bundle).
- No default import of `i18next`: use `useTranslation` (components) or `getFixedT` (outside React).
- No module-level state shared between requests: the router, the i18n instance and the CSP nonce are per request.
- No `any`, no `@ts-ignore`, no `!`, no `console.log`, files under 400 lines, kebab-case file names.
- Nothing hardcodes `'ar'` or `'en'`: the language list, direction, hreflang, fonts and date format come from
  `LOCALES` / `LANGUAGES` (`src/shared/lib/i18n/languages.ts`). `params.locale` is already a `Locale`: no `toLocale`.
- Article text is read only through `src/content/articles.ts` (async, per language), never imported by a page.
- A submit is single-flight (`createSingleFlight`) and handles loading, error and success.
- Never edit: `src/routeTree.gen.ts` (generated), `.env*`, `.github/`, `deploy/`.
- Ask before every commit and push. Conventional commits (commitlint). One branch per task.

## Commands

```text
npm run setup:env         # once: copies .env.example to .env.local (build and dev read it)
npm run dev               # http://localhost:5190 (fixed port: strictPort)
npm run typecheck | lint:check | fmt (writes) | fmt:check | i18n:validate | check:env | check:css | check:tooling | test
npm run check             # all of the above in one run
VITE_SITE_URL=https://example.com npm run build   # then: npm run check:bundle (page size budget, form libs only on /contact)
npm run test:e2e          # builds, serves the production build on :5191 (E2E_PORT=5461 to change), Playwright
npm run check:full        # check + build + check:bundle + test:e2e
```

One unit file: `npx vitest run path/to/file.test.ts`. One e2e project: `npx playwright test --project=en-desktop`;
`E2E_SKIP_BUILD=1` reuses the last build. After adding a route file run `npm run dev` or `npm run build` once: it
regenerates `src/routeTree.gen.ts`. After renaming or copying files run `npm run fmt`.

## Folder map

```text
src/routes/            thin route files: path, head(), loader, the component import
  __root.tsx           <html lang dir>, CSS, fonts, theme init script, robots meta for failed pages
  $locale.tsx          typed language param (`params.parse`: an unknown language does not match), header + footer
  $.tsx  $locale/$.tsx splat routes: any unmatched URL is a real 404 (title and noindex come from its status)
  $locale/             index, about, services, contact, news/index, news/$slug
  index.tsx            "/" redirects to a language (cookie, Accept-Language, default)
  robots[.]txt.ts  sitemap[.]xml.ts
src/features/website/<page>/   index.tsx, locales/<language>.json, use-<page>-page.ts only when the page loads data
  contact/{components,hooks,server,validations}   news/pages/article/ (the head and page of one article)
src/content/           the CMS seam: articles.ts (async API), articles.data.ts + bodies/<slug>.ts (demo data), types.ts
src/features/fallback/  not-found and route-error pages
src/config/            site.config.ts (name, email, phone, share image) and nav.config.ts (menu, footer, sitemap)
src/shared/            components/ (header, footer, Picture, ArticleCard), env/, lib/i18n (registry, resources, key
                       types), lib/seo (seo, pageHead), lib/zod.ts, server/ (security headers, env check, "/" redirect),
                       style/ (tokens, fonts), utils/ (theme, dates), locales/
src/start.ts           request middleware: body limit, CSRF, canonical redirect, security + cache headers
src/test/              setup.ts, render.tsx      e2e/  raw/ (server answers)  ui/ (browser)  fixtures/
scripts/               checks (env, css, i18n, tooling, bundle) and the e2e server
```

## Add a page

`src/features/website/<page>/` with `index.tsx` and `locales/<language>.json` for every language (loaded by a glob:
no registration; the validator checks them); add `import type x from '@/features/website/<page>/locales/<default>.json'`
and `& typeof x` in `src/shared/lib/i18n/i18next.d.ts` (the typed keys; the validator fails if you forget);
add `src/routes/$locale/<page>.tsx` (copy `about.tsx`: its head is `pageHead(params.locale, '/$locale/<page>')`); run
`npm run dev` once; add one `navItem(...)` in `src/config/nav.config.ts` (menu, footer, sitemap and head: `labelKey`,
`metaTitleKey`, `metaDescriptionKey`) with the `nav.<page>` key in `src/shared/locales/`; add the page to `PAGES` in
`e2e/fixtures/app.ts`. Then `npm run check` and `npm run test:e2e`.

## Add a language

One registry, `src/shared/lib/i18n/languages.ts`; see "Add a language" in `.claude/rules/i18n-rtl.md` for the steps. In
short: add the code to `LOCALES` and an entry to `LANGUAGES`, run `npm run typecheck` (it lists every place that needs
the new code), add a `<code>.json` beside every `locales/ar.json` (`npm run i18n:validate` lists the missing ones).

## Add a language string

Page text: `src/features/website/<page>/locales/<language>.json`. Text used everywhere (nav, footer, errors):
`src/shared/locales/`. Same key, same `{{variables}}` in both files, shape `group.key`. Use `t('group.key')` with a
literal key. `npm run i18n:validate` checks it.

## Add a contact form field

`validations/contact-schema.ts` (schema and `EMPTY_CONTACT`), `components/contact-form.tsx` (label, input,
`aria-invalid`, `aria-describedby`), the error and label keys in the feature's `locales/` (a new error message
also goes into `CONTACT_MESSAGES`, so the form can translate it with a typed key),
`server/deliver-contact.server.ts` (the JSON posted to the webhook), and the tests next to them. Keep the honeypot
`contactRef` and its odd name.

## Conventions

- Every plain page: `head: ({ params }) => pageHead(params.locale, '/$locale/<page>')`. One `<h1>` per page;
  `<main id="main">` comes from `LocaleLayout`. A page that reads content gets it from its route `loader`
  (`getArticle(params.slug, params.locale)`), and head and component read the same `loaderData`. Cards and
  components in `src/shared` take plain props and import no feature.
- Tests sit next to the file. A test that needs the browser (`window`, storage) is named `*.dom.test.ts`.
- Commit messages: `type(scope): subject`. Definition of done: `npm run check` (+ `npm run build`,
  `npm run check:bundle` and `npm run test:e2e` when a route, a header or the UI changed).
