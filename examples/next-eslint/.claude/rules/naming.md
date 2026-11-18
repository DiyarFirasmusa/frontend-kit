---
paths:
  - "src/**"
  - "e2e/**"
---

# Naming

The full layout lives in `CLAUDE.md` (and any structure doc it points to).
This is the short form.

**kebab-case for every file and folder under `src/`**, with one exception:
route files under `src/app/` follow the Next.js App Router conventions
(`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
`route.ts`, `[param]/`, `(group)/`, `_private/` for colocated non-route
folders). PascalCase only for component and type names in code.
`next-env.d.ts` is generated — never edit it.

## Files

| What | File | Example |
| ---- | ---- | ------- |
| Route | `src/app/<path>/page.tsx` (App Router naming) | `src/app/orders/[orderId]/page.tsx` |
| Component | `<thing>.tsx` | `order-card.tsx`, `confirm-delete-dialog.tsx` |
| Dialog | `<thing>-dialog.tsx` | `edit-address-dialog.tsx` |
| Page hook | `hooks/use-<page>-page.ts` | `use-order-detail-page.ts` |
| Data / mutation hook | `hooks/use-<thing>.ts` | `use-orders.ts`, `use-archive-order.ts` |
| Service | `services/<entity>.service.ts` | `orders.service.ts` |
| Store | `<name>-store.ts` | `settings-store.ts` |
| Types | `types/types.ts` or `types/<topic>.ts` | |
| Schemas | `validations/validations.ts` or `validations/<topic>.ts` | |
| Pure helpers | `utils/<topic>.ts` — never `utils.ts`, `helpers.ts`, `misc.ts` | `price-math.ts` |
| Constants | kebab-case | `query-keys.ts`, `api.ts` |
| Unit / component test | `<source>.test.ts(x)` beside the source | `price-math.test.ts` |
| E2E spec | `e2e/<flow>.spec.ts` | `e2e/sign-in.spec.ts` |

Never name a file after its folder (`detail/detail.tsx`) and never write an
`index.ts` barrel.

## Code

| What | Rule | Example |
| ---- | ---- | ------- |
| Route export | `export default` page/layout component (Next.js requires it) | |
| Page component | `<Entity><Page>Page` | `OrderDetailPage` |
| Layout | `<Name>Layout` | `AppLayout`, `SettingsLayout` |
| Component | PascalCase noun, named export | `OrderCard` |
| Page hook | `use<Entity><Page>Page` | `useOrderDetailPage` |
| Data hook | `use<Entity>` / `use<Entity>List` | `useOrder`, `useOrders` |
| Mutation hook | `use<Verb><Entity>` | `useArchiveOrder` |
| Service function | verb first, free async function | `fetchOrders`, `createAddress` |
| Store hook | `use<Name>Store` | `useSettingsStore` |
| Type | PascalCase, no `I` prefix; suffix by role | `OrderRow`, `CreateOrderPayload`, `AddressValues` |
| Props | `Props` (local) or `<Component>Props` (exported) | `OrderCardProps` |
| Schema | `<x>Schema` + `<X>Values` + `default<X>Form` | `addressSchema` |
| Search schema | `<page>SearchSchema` | `ordersSearchSchema` |
| Constant | SCREAMING_SNAKE_CASE | `PAGE_SIZE`, `MAX_OTP_LENGTH` |
| Boolean | `is` / `has` / `can` / `should` | `isPending`, `hasAccess` |
| Handler | `handle<Event>` inside, `on<Event>` as a prop | `handleSubmit`, `onRemove` |
| Cache keys (when a data layer exists) | one factory, `<factory>.<domain>.<key>` | `qk.orders.detail(id)` |

**Backend fields** stay exactly as the API sends them. Use the generated API
types; never rename a field in a type that mirrors the wire.

## Variables

- camelCase for every variable, function and parameter.
- No single-letter names, even in callbacks: `orders.map((order) => order.id)`,
  `onChange={(event) => …}`. The only exception is an unused `_`.
- No abbreviations (`btn`, `cfg`, `qty` → `button`, `config`, `quantity`).
- No underscore-prefixed identifiers (`isRetry`, not `_retry`).
