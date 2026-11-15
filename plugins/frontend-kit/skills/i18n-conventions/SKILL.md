---
name: i18n-conventions
description: Enforces the project's i18n conventions — exactly two-level translation keys (group.key), `useTranslation()` from react-i18next with full static keys, no dynamic keys, Arabic and English always together. Use when adding or editing locale files (the global locales or a feature's locales/{ar,en}.json), adding keys, calling t(), or refactoring i18n. Run `npm run i18n:validate` after touching translations.
---

# i18n conventions

i18next + react-i18next. Arabic (`ar`, RTL) is the default; English (`en`,
LTR) is fully supported. `CLAUDE.md` names the i18n setup file and the
language list.

Bundles:

- The global `locales/{ar,en}.json` — shell, shared components, common words:
  every key used by shared code or by two or more features.
- `<feature>/locales/{ar,en}.json` — keys used by that feature only, when the
  project splits bundles per feature. Feature bundles are
  loaded before the first render: merged at build time with
  `import.meta.glob('/src/**/locales/{ar,en}.json', { eager: true })`, or
  registered with `addResourceBundle` in the route **loader**, never from the
  component (`head()` and the hydration render run first). The test setup
  imports every bundle. Same `translation` namespace everywhere,
  so moving a key between bundles never changes a call site; a key lives in
  one bundle only.

Website (TanStack Start): the language is known on the server (cookie or
URL) so the HTML renders with the right `lang`, `dir` and strings — never
switch language after hydration. Dashboard (Vite + TanStack Router): the
language comes from the persisted setting on load.

## 1. Exactly two levels

`group.key` — e.g. `orders.emptyTitle`, `common.save`. One level or three+
levels are rejected. Both segments camelCase. i18next plural suffixes are
allowed on the second segment (`orders.itemsCount_one`, `_other`; Arabic also
`_zero`, `_two`, `_few`, `_many` only where the sentence changes).

Flatten deeper keys by joining the sub-group into the key:

```json
{ "settings": { "accountTypes": { "personal": "…" } } }   // ✗
{ "settings": { "accountTypePersonal": "…" } }            // ✓
```

Lists that were arrays or numeric keys (`date.months.0`, `about.faqs.1`)
become named keys (`date.monthJanuary`, `about.faq1Question`) or move to code
when they are data, not copy.

## 2. `useTranslation()` with no namespace

```ts
const { t } = useTranslation()          // from 'react-i18next'
t('orders.emptyTitle')                  // full key at the call site
```

Never `useTranslation('orders')` + `t('emptyTitle')` and never `keyPrefix` —
the full key must be visible to search and to `i18n-ally`. (`useTranslations`
is next-intl's API; it does not exist here.)

Outside React (services, utils, the API client): `i18n.t('group.key')` from
the project's i18n setup module.

## 3. Static keys only

```ts
t(`orderStatus.${status}`)        // ✗ template literal
t('orders.status' + name)         // ✗ concatenation
const key = 'orders.paid'; t(key) // ✗ variable
```

For enums and statuses, build a map of static calls:

```ts
export function orderStatusLabel(t: TFunction, status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: t('orders.statusPending'),
    paid: t('orders.statusPaid'),
    failed: t('orders.statusFailed'),
  }
  return labels[status]
}
```

Schemas carry keys, not text (`z.string().min(1, { message: 'validation.required' })`);
the field component translates them.

## 4. Interpolation and plurals

`t('orders.itemsCount', { count })` with the plural forms in each file. Never
build sentences by concatenating translated fragments — word order differs
between Arabic and English.

## Rules

- Every key in **both** files, same structure; Arabic is written, not machine-filled.
- No user-facing string in JSX, toasts, `aria-label`, `alt`, `title` or
  placeholders without `t()`.
- Backend messages are shown only when they are in the UI language (the API
  client's error resolver handles it) — don't translate them by hand.
- `npm run i18n:validate` must pass: two levels, camelCase, ar/en parity,
  plural forms (`_one` + `_other` in both; Arabic extras optional), no key in two
  bundles, and every static key the code names exists.
- Prices, numbers, dates and times go through the project's formatters (UI
  language, Western digits, a dash for bad input). No language-dependent
  `toLocale*String` in features.
