---
paths:
  - '**/locales/*.json'
  - 'src/shared/lib/i18n/**'
  - 'src/shared/components/language-switcher.tsx'
  - 'scripts/validate-i18n.ts'
  - 'scripts/check-logical-css.ts'
---

# Texts, languages, direction

- Two languages always, in the same change: `ar` and `en`, same keys, same `{{variables}}`. Keys are `group.key`
  (two levels, camelCase). A group name lives in one file only. `npm run i18n:validate` checks all of it, and that every
  literal `t('group.key')` in code exists.
- Where text lives: a page in `src/features/website/<page>/locales/{ar,en}.json`; text every page needs (nav, footer,
  common, `error.*`) in `src/shared/locales/`.
- Registration: every bundle is imported by hand in `src/shared/lib/i18n/resources.ts` and added to the `merge(...)` of
  both languages (everything is bundled so server-rendered text is never a raw key). A new `locales/` folder needs
  those lines.
- In code: `t('group.key')` with a literal key (a template literal fails the validator; the escape is a trailing
  `// i18n-dynamic-ok`). Keys kept in data (`labelKey`, a zod `message`) must exist too and are translated where shown.
  Counted text uses `_one` / `_other` keys.
- The language is the URL prefix: `LOCALES`, `DEFAULT_LOCALE`, `directionOf`, `swapLocaleInPath` in
  `src/shared/lib/i18n/languages.ts`. Nothing else hardcodes `'ar'`, `'en'`, `rtl` or `ltr`. `<html lang dir>` is set by
  `__root.tsx` from the request's i18n instance.
- Outside React (`head()`, server code) use `getFixedT(locale)`; inside, `useTranslation()`. Never the default export
  of `i18next` (lint rule): each request has its own instance, made in `getRouter` and held in the router context.
- Switching language is a plain link to the same path in the other language; `LanguageSwitcher` also saves the choice
  in the `lang` cookie (read only by the "/" redirect).
- RTL: logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`, `rounded-s`).
  A pointing icon carries `icon-directional` (mirrored in RTL) or `rotate-180`. Latin text and numbers inside Arabic
  need `dir="ltr"` only where the order matters (phone, codes). `npm run check:css` fails on physical directions; a
  line that really needs one says `physical-css-ok: why`.
- Dates go through `formatDate(locale, date)`; do not format dates by hand.
