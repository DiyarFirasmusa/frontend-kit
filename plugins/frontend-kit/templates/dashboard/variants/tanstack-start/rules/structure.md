---
paths:
  - "src/features/**"
  - "src/layout/**"
  - "src/shared/**"
---

# Folder structure (TanStack Start dashboard)

The kit's feature-first, ownership-based structure, merged with the layout of a production TanStack Start portal:
one `shared/` root for everything global, one folder per shell under `layout/`, features flat under `features/`,
and `tabs/` and `steps/` for split pages. Folder structure only: the admin keeps its language in the settings store,
not in a `{-$locale}` URL segment.

```text
src/
├── client.tsx  router.tsx  routeTree.gen.ts  env.ts
├── routes/                           thin: guard + validateSearch + loader + container
│   ├── __root.tsx
│   ├── _auth/login.tsx  forgot-password.tsx       requireGuest
│   ├── _app/                         requireAuth
│   │   ├── _main/                    the app shell (sidebar + top bar)
│   │   │   ├── index.tsx             overview
│   │   │   └── <resource>/index.tsx  <resource>/$id/index.tsx
│   │   ├── _focused/                 no sidebar, one task (create, edit)
│   │   └── _wizard/                  bare; a wizard draws its own chrome
│   └── (errors)/403.tsx  401  500
├── layout/<shell>/                   main/ auth/ (focused/ wizard/ when used): index.tsx + components/, plus hooks/ and data/ (nav config, sign-out hook) when the shell needs them
├── features/<entity>/                flat: route groups are guards and shells, not product areas
│   ├── index.tsx                     the main (list) page container
│   ├── components/  (dialog/)        what the main page uses
│   ├── hooks/                        use-<page>-page.ts (list page: use-list-page.ts), <entity>-actions.ts, query/, filter/, form/
│   ├── api/<entity>.api.ts           HTTP calls
│   ├── types/types.ts  validations/ (validations.ts, search.ts)  utils/  data/ (static data)  locales/{ar,en}.json
│   ├── pages/<page>/                 every other page: its own index.tsx + hooks/ api/ types/ components/ utils/
│   ├── tabs/<tab>/                   a page split into tabs: the shell is index.tsx, one folder per tab
│   └── steps/<step>/                 a wizard: the shell is index.tsx, one folder per step
├── shared/
│   ├── components/                   ui/ (shadcn primitives) table/ filters/ fields/ form/ wrapper/ (loading, error, empty, page-level state) dialog/ composed/ (pieces made of several primitives used by 2+ features: language switch, page loading)
│   ├── api/                          clients/ (config, envelope, interceptors, privateApi, publicApi), error/ (error resolution), <x>.api.ts for app-wide calls (auth, token, /me)
│   ├── constants/                    api.ts, query-keys.ts (qk), permissions.ts (PERMS)
│   ├── guards/  hooks/ (query/)  context/  lib/ (i18n, query-client)  locales/  store/  style/  types/  utils/  validations/
└── test/
```

## Path map (what the shared rules and skills call things)

| A rule or skill says                              | In this variant                                    |
| ------------------------------------------------- | -------------------------------------------------- |
| `src/components/…`, `src/constants/…`, `src/hooks/…`, `src/guards/…`, `src/store/…`, `src/lib/…`, `src/types/…`, `src/utils/…`, `src/locales/…`, `src/api/…` | the same folder under `src/shared/` (clients in `src/shared/api/clients/`) |
| `src/styles/`                                     | `src/shared/style/`                                |
| `src/api/core/`, `src/api/error/`                 | `src/shared/api/clients/`, `src/shared/api/error/` |
| `src/services/<x>.service.ts` (token, session)    | `src/shared/api/<x>.api.ts`                        |
| `src/routes/_app/`                                | `src/routes/_app/_main/` (or `_focused/`, `_wizard/`) |
| `features/<group>/<entity>/`                      | `features/<entity>/`                               |
| `<entity>/services/<entity>.service.ts`           | `<entity>/api/<entity>.api.ts`                     |
| `src/layout/`                                     | `src/layout/<shell>/`                              |

## Rules that decide

- **A file lives in the deepest folder that contains every importer** (one page: that page; two sibling pages: their
  parent `pages/`; the main page: the feature root; two features: `src/shared/`). Promote on the second use, never before.
- **The feature root is the main page**; every other page is a folder under `pages/` and owns its files.
- **Containers render, hooks think**: `index.tsx` calls one orchestrating hook; presentational components never fetch.
- **Hooks by role**: server state in `hooks/query/`, filter state in `hooks/filter/`, form state (dialog or page) in `hooks/form/`.
- **Page hook name**: `use-<page>-page.ts` (`use-list-page.ts` for the main list, `use-overview-page.ts`, `use-settings-page.ts`).
- A feature without a main page (errors) keeps what its pages share at the feature root, never in `pages/components/`.
- A hook the kit says is shared (`use-unsaved-changes-guard`) stays in its feature until a second feature needs it.
- A folder at the top of `src/` is a structural decision, never "where did this helper end up": globals go in `shared/`.
- Create `shared/components/{table,wrapper,…}` when something real goes in; no empty folders.
- No barrels; kebab-case files; a page never imports a sibling page; imports go up, never sideways.
