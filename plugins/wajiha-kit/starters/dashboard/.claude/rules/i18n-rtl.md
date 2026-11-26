---
paths:
  - 'src/locales/**'
  - 'src/**/locales/**'
  - 'src/lib/i18n/**'
  - 'src/components/**'
  - 'src/layout/**'
  - 'src/features/**/components/**'
  - 'src/features/**/index.tsx'
  - 'scripts/validate-i18n.ts'
---

# Languages, translations and RTL

Arabic (RTL) is the default, English (LTR) the second. The list of languages is one
file, `src/lib/i18n/languages.ts` (its header explains adding a third).

- Every user-facing string is a key in **both** `ar.json` and `en.json`: global
  text in `src/locales/`, a feature's text in `src/features/.../locales/` under one
  top-level camelCase namespace (`suppliers.*`). `npm run i18n:validate` fails when
  one language misses a key the other has.
- A feature's bundle is loaded by its route loader: `loadFeatureLocale('dashboard/<x>')`.
  Never call `t()` for a feature namespace on a page whose loader did not load it.
- Zod messages and status labels are **keys** (`'suppliers.validation.codeRequired'`);
  translate where they render. Interpolate names (`t('x.delete.description', { name })`),
  never concatenate sentences.
- Row-action labels name the row (`Edit {{name}}`) so every icon button is distinguishable.
- Tests read text through `tt(key)` from `@/test/i18n`; e2e matches both languages
  (`/^(Add supplier|إضافة مورد)$/`) because the suite runs in Arabic and English.
- Layout uses logical properties only: `ms-` `me-` `ps-` `pe-` `start-` `end-`
  `text-start` `text-end`, `rtl:rotate-180` / `rtl:-scale-x-100` for directional
  icons. `ml-` `mr-` `left-` `right-` fail `conventions.test.ts`.
- Codes, phone numbers, emails and ids are `dir="ltr"` inside RTL forms and tables.
  Numbers are Western digits in both languages.
- Arabic sets bigger small text and roomier headings through `TYPE_RAMP_ARABIC`
  (`src/style/tokens/foundation.ts`); do not patch sizes per component.
- Check every screen change in Arabic and English, light and dark, phone and desktop.
