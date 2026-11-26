---
paths:
  - '**/locales/*.json'
  - 'src/shared/lib/i18n/**'
  - 'src/shared/style/fonts.ts'
  - 'src/shared/components/language-switcher.tsx'
  - 'scripts/validate-i18n.ts'
  - 'scripts/check-logical-css.ts'
---

# Texts, languages, direction

- Every language in `LOCALES` always, in the same change: same keys, same `{{variables}}`. Keys are `group.key`
  (two levels, camelCase). A group name lives in one bundle only. `npm run i18n:validate` checks all of it, and that
  every literal `t('group.key')` in code exists. `t()` is typed (`src/shared/lib/i18n/i18next.d.ts`): a key that
  exists nowhere is a compile error; data that holds keys is typed `ParseKeys` (`labelKey`, `CONTACT_MESSAGES`).
- Where text lives: a page in `src/features/website/<page>/locales/{ar,en}.json`; text every page needs (nav, footer,
  common, `error.*`) in `src/shared/locales/`.
- Registration: none. `src/shared/lib/i18n/resources.ts` loads every `src/**/locales/<language>.json` by one glob and
  merges key by key (everything is bundled so server-rendered text is never a raw key). It throws, and the validator
  and `resources.test.ts` fail, on a file that is not a language in `LOCALES`, a folder missing a language, a key or a
  group defined in two bundles. The one manual line: list a new bundle in `i18next.d.ts` (typed keys); the validator
  fails when it is missing.
- In code: `t('group.key')` with a literal key (a template literal fails the validator; the escape is a trailing
  `// i18n-dynamic-ok`). Keys kept in data (`labelKey`, a zod `message`) must exist too and are translated where shown.
  Counted text uses `_one` / `_other` keys.
- The language is the URL prefix: `LOCALES`, `LANGUAGES`, `DEFAULT_LOCALE`, `directionOf`, `swapLocaleInPath` in
  `src/shared/lib/i18n/languages.ts`. Nothing else hardcodes `'ar'`, `'en'`, `rtl` or `ltr`. `<html lang dir>` is set by
  `__root.tsx` from the request's i18n instance. `params.locale` of every route under `/$locale` is a `Locale` (the
  route's `params.parse` refuses other values), so pages never call `toLocale`; that helper is for untrusted input
  (the URL read in `__root.tsx`, `i18n.language`).
- Outside React (`head()`, server code) use `getFixedT(locale)`; inside, `useTranslation()`. Never the default export
  of `i18next` (lint rule): each request has its own instance, made in `getRouter` and held in the router context.
- Switching language is a plain link to the same path in each other language (its own name from `LANGUAGES`);
  `LanguageSwitcher` also saves the choice in the `lang` cookie (read only by the "/" redirect).
- Add a language, one registry: (1) add the code to `LOCALES` and an entry to `LANGUAGES` (label, `dir`, `hreflang`,
  `ogLocale`, `dateTag`) in `languages.ts`; (2) `npm run typecheck` now lists what is left: `SITE.names`
  (`site.config.ts`), `PRELOAD_FONTS` (`src/shared/style/fonts.ts`), each article's `text` and `bodies/<slug>.ts`;
  (3) add `<code>.json` beside every `ar.json`, in every `locales/` folder (`npm run i18n:validate` names the missing
  ones; it also reads `LOCALES`); (4) run `npm run check` and `npm run test:e2e`: they need NO test edit, because the
  tests read `LOCALES` and `LANGUAGES` (the switcher, sitemap, hreflang, validator, fixtures and the Playwright
  projects are all built from them) and use the fake code `zz` for "an unsupported language". A test that goes red
  after a new language is hard-coding the old list: make it read `LOCALES`, never delete the assertion, and never use
  a real language code (`fr`, `de`) as the unsupported one. Read `deploy/` and `public/` for anything
  language-specific (`public/site.webmanifest` carries the default language's name; a test ties it to `SITE`); you edit
  `public/`, not `deploy/`. Arabic plural forms: counted nouns need all six; another language needs its own forms.
  Cost: every language's text is bundled into the entry script (about 0.3 to 1.3 KB gzip each; see "الأداء" in
  `STRUCTURE.md` for the budget headroom).
- RTL: logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`, `rounded-s`).
  A pointing icon carries `icon-directional` (mirrored in RTL) or `rotate-180`. Latin text and numbers inside Arabic
  need `dir="ltr"` only where the order matters (phone, codes). `npm run check:css` fails on physical directions; a
  line that really needs one says `physical-css-ok: why`.
- Dates go through `formatDate(locale, date)`; do not format dates by hand.
