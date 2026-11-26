---
paths:
  - '**/locales/*.json'
  - 'src/shared/lib/i18n/**'
  - 'src/features/site/i18n/**'
  - 'src/features/admin/i18n/**'
  - 'scripts/validate-i18n.ts'
  - 'src/components/common/language-switcher.tsx'
---

# Texts, languages, direction

- Two languages always, in the same change: `ar` and `en`, same keys, same `{{variables}}`. Keys are `group.key`
  (two levels, camelCase). A group name is unique across every locale file. `npm run i18n:validate` checks all of it.
- Where text lives: a public feature in `src/features/site/<page>/locales/`; the admin in
  `src/features/admin/<feature>/locales/`, and the general admin text (navigation labels, the no-access page) in
  `src/features/admin/locales/`; shared UI text in `src/components/locales/` (group `ui`); text needed everywhere,
  including before the admin loads (nav, common, `error.*`), in `src/shared/locales/`.
- Registration: a public bundle is imported in `src/features/site/i18n/resources.ts` (it is bundled for SSR). Admin
  bundles are found by folder (`import.meta.glob` in `admin-resources.ts`): a new `locales/` folder needs no line.
- The language is the URL prefix. One i18next instance per request lives in the router context. The admin adds its
  bundles in `beforeLoad` (`loadAdminI18n`); a component that can render before that (an unknown-URL page) may only
  use keys from `src/shared/locales`.
- In code: `t('group.key')` with a literal key (a template literal key fails the validator; the escape is a trailing
  `// i18n-dynamic-ok`). Keys kept in data (`labelKey`, `successMessage`) must exist too.
- Language switching is a plain link to the same path in the other language and keeps the query string and hash
  (`LanguageSwitcher`). `?redirect=` on the login page is rewritten into the new language by `safeReturnPath`.
- `<html lang dir>` is set by the root from the URL. Never hardcode `rtl` or `ltr`; use `directionOf(locale)`.
- RTL: logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`). Icons that
  point (arrows, chevrons) flip in RTL. Latin text and numbers inside Arabic need `dir="ltr"` only where the order
  matters (user names, codes). `npm run check:css` fails on physical directions.
