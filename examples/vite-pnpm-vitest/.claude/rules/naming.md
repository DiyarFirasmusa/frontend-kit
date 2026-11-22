---
paths:
  - "src/**"
  - "e2e/**"
---

# Naming

> **Examples, not law.** The project's own names win: "Where things are" in `project.md`, then the nearest file of the same
> role, then the framework's convention. The folders, suffixes and case below are the kit's example (React + TanStack), for
> a project with no pattern. What holds everywhere: a name says what the thing is, and one role is named one way.

> **Router.** The project has no router yet (`stack.router` is `none`). The router-specific lines below (`createFileRoute`,
> `Route`, `src/routes/`, `routeTree.gen.ts`) are TanStack Router's: keep the intent (thin routes, guards in the route layer,
> params and search validated once at the boundary) and use `routing.md` for the equivalents.

The full layout lives in `CLAUDE.md` (and any structure doc it points to).
This is the short form.

**The example: kebab-case for every file and folder under `src/`**, with one exception:
route files under `src/routes/` follow TanStack Router's file conventions
(`__root.tsx`, `index.tsx`, `$param.tsx`, `_layout.tsx`, `(group)/`,
`-components/` for colocated non-route files). PascalCase only for component
and type names in code. `src/routeTree.gen.ts` is generated — never edit it.

## Files

| What | File | Example |
| ---- | ---- | ------- |
| Route | `src/routes/<path>.tsx` (TanStack Router naming) | `src/routes/orders/$orderId.tsx` |
| Component | `<thing>.tsx` | `order-card.tsx`, `confirm-delete-dialog.tsx` |
| Dialog | `<thing>-dialog.tsx` | `edit-address-dialog.tsx` |
| Page hook | `hooks/use-<page>-page.ts` | `use-order-detail-page.ts` |
| Query / mutation hook | `hooks/query/use-<thing>.ts` | `use-orders.ts`, `use-archive-order.ts` |
| Service | `services/<entity>.service.ts` | `orders.service.ts` |
| Server function (website) | `<entity>.functions.ts` or as `CLAUDE.md` says | `orders.functions.ts` |
| Store | `<name>-store.ts` | `settings-store.ts` |
| Types | `types/types.ts` or `types/<topic>.ts` | |
| Schemas | `validations/validations.ts` or `validations/<topic>.ts` | |
| Pure helpers | `utils/<topic>.ts` — never `utils.ts`, `helpers.ts`, `misc.ts` | `price-math.ts` |
| Constants | kebab-case | `query-keys.ts`, `api.ts` |
| Locales | `locales/<language>.json` | `locales/{ar,en}.json` |
| Unit / component test | `<source>.test.ts(x)` beside the source | `price-math.test.ts` |
| E2E spec | `e2e/<flow>.spec.ts` | `e2e/sign-in.spec.ts` |

Never name a file after its folder (`detail/detail.tsx`) and never write an
`index.ts` barrel.

## Code

| What | Rule | Example |
| ---- | ---- | ------- |
| Route export | `export const Route = createFileRoute(...)` | |
| Page component | `<Entity><Page>Page` | `OrderDetailPage` |
| Layout | `<Name>Layout` | `AppLayout`, `SettingsLayout` |
| Component | PascalCase noun, named export (default only where a framework file needs one) | `OrderCard` |
| Page hook | `use<Entity><Page>Page` | `useOrderDetailPage` |
| Query hook | `use<Entity>` / `use<Entity>List` | `useOrder`, `useOrders` |
| Mutation hook | `use<Verb><Entity>` | `useArchiveOrder` |
| Query options | `<entity>QueryOptions` | `orderQueryOptions(id)` |
| Service function | verb first, free async function | `fetchOrders`, `createAddress` |
| Store hook | `use<Name>Store` | `useSettingsStore` |
| Type | PascalCase, no `I` prefix; suffix by role | `OrderRow`, `CreateOrderPayload`, `AddressValues` |
| Props | `Props` (local) or `<Component>Props` (exported) | `OrderCardProps` |
| Schema | `<x>Schema` + `<X>Values` + `default<X>Form` | `addressSchema` |
| Search schema | `<page>SearchSchema` | `ordersSearchSchema` |
| Constant | SCREAMING_SNAKE_CASE | `PAGE_SIZE`, `MAX_OTP_LENGTH` |
| Boolean | `is` / `has` / `can` / `should` | `isPending`, `hasAccess` |
| Handler | `handle<Event>` inside, `on<Event>` as a prop | `handleSubmit`, `onRemove` |
| Query keys | `<factory>.<domain>.<key>` | `qk.orders.detail(id)` |
| Translation keys | exactly two levels, camelCase | `orders.emptyTitle` |

**Backend fields** stay exactly as the API sends them. Use the generated API
types; never rename a field in a type that mirrors the wire.

## Variables

- camelCase for every variable, function and parameter.
- No single-letter names, even in callbacks: `orders.map((order) => order.id)`,
  `onChange={(event) => …}`. The only exception is an unused `_`.
- No abbreviations (`btn`, `cfg`, `qty` → `button`, `config`, `quantity`).
- No underscore-prefixed identifiers (`isRetry`, not `_retry`).
