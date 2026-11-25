# src/features/dashboard

One folder per backend resource. Names are unique inside the whole tree, so a
search for `use-suppliers-list-page` finds exactly one file.

```text
src/features/dashboard/<entity>/
├── index.tsx                              → the list page: JSX and one page hook
├── components/<x>-columns.tsx             → getXColumns({ t, ...handlers }): Column<Row>[]
├── components/dialog/<x>-form-dialog.tsx  → create and edit form
├── hooks/use-<x>-list-page.ts             → useXListPage(): the one hook the page calls
├── hooks/<x>-actions.ts                   → canX(row) / getXRowActions(...)
├── hooks/query/use-<x>-list.ts            → useXList(params), plus detail and mutation hooks
├── hooks/filter/  hooks/form/             → filter state, dialog form hooks
├── services/<entity>.service.ts           → fetchX / createX / updateX / deleteX
├── types/types.ts                         → Row, Detail, ListParams, Payload
├── validations/validations.ts             → xSchema, XValues, defaultXForm (zod)
├── utils/<x>-status.ts                    → status badges
├── utils/<x>-export-columns.ts            → Excel export columns
├── <x>-test-utils.ts                      → fixtures for this feature's tests
├── locales/{en,ar}.json                   → one top-level camelCase namespace
└── pages/<page>/index.tsx                 → detail, create, edit: each with its own hooks/ and components/
```

Rules that keep it small:

- A file lives in the deepest folder that contains every importer. Move it to
  `src/` when a second feature needs it, not before.
- A feature never imports another feature. Shared code goes down to `src/`.
- Deleting a row uses `useDeleteTarget` from `src/hooks`: `deleteTarget`,
  `isDeleteOpen`, `openDelete`, `closeDelete` are the names everywhere.
- The home page (`home/`) is the model for a read-only page: widgets, each with
  its own query hook, all behind one `use-home-page.ts`.
