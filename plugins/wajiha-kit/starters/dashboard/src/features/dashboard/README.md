# src/features/dashboard

One folder per backend resource. **`suppliers/` is the reference entity**: it
follows the kit's dashboard rules exactly (URL-owned list state, server paging
and sorting, TanStack Table, shared `queryOptions`, cancellation, one dialog
union, edit loaded by id, backend field errors on the inputs, delete confirm,
reactive permissions). Copy it for a new entity.

```text
src/features/dashboard/suppliers/
├── index.tsx                               → the list page: JSX and one useSuppliersListPage() call
├── hooks/use-list-page.ts                  → builds columns, wires table, dialog, delete and export
├── hooks/filter/use-supplier-filters.ts    → the route's search + useListSearch (pagination, sort, filters in the URL)
├── hooks/form/use-supplier-form-dialog.ts  → dialog state union, form, field-error mapping
├── hooks/query/use-suppliers-list.ts       → suppliersListQueryOptions(params) + useSuppliersList
├── hooks/query/use-supplier-detail.ts      → supplierDetailQueryOptions(id) + useSupplierDetail
├── hooks/query/use-supplier-mutations.ts   → create / update / delete, invalidate in onSuccess
├── hooks/supplier-actions.ts               → pure getSupplierRowActions(row, { can, ... })
├── components/supplier-columns.tsx         → getSupplierColumns({ t, getActions }) on TanStack Table
├── components/supplier-filter-bar.tsx      → <search> with SearchField + status select + clear
├── components/dialog/supplier-form-dialog.tsx
├── services/suppliers.service.ts           → fetchSuppliers(params, { signal }) ... toSupplierListQuery
├── types/types.ts                          → Row, Detail, ListParams, ListResponse (PageResponse)
├── validations/search.ts                   → the URL schema (every field .catch() + default)
├── validations/validations.ts              → form schema, defaults, toPayload / toFormValues
├── utils/list-params.ts                    → toSupplierListParams(search)
├── utils/supplier-export-columns.ts        → Excel columns (the export reads the filtered set)
├── supplier-test-utils.ts                  → fixtures for this feature's tests
└── locales/{en,ar}.json                    → one top-level camelCase namespace
```

Every other list in the starter follows the same shape, and each adds one thing
suppliers does not show:

- `units-of-measure/`: a second filter (decimal places) and a validation rule from the backend (422 on a field).
- `warehouses/`: a detail page (`pages/detail/`) with tabs in the URL, an edit dialog shared with the list, delete then leave the page, and a not-found state.
- `categories/`: a tree (the whole hierarchy comes flat from the server, its search and the selected node live in the URL), a second page (`pages/attributes/`, a full list of its own) and a bounded sub-list rendered with the table's `hidePagination`.
- `home/`: a read-only page of widgets.

The pieces every list shares live in `src/`, not in a feature: `hooks/use-list-search.ts` (pagination, sorting, filters and clearing as URL state, plus the past-the-end page clamp), `hooks/use-delete-dialog.ts`, `hooks/use-list-export.ts`, `lib/list-search.ts` (the URL schema parts), `utils/table-state.ts`, `components/table/data-table.tsx`, `api/error/field-errors.ts`.

Rules that keep it small:

- A file lives in the deepest folder that contains every importer. Move it to
  `src/` when a second feature needs it, not before.
- A feature never imports another feature (lint enforces it, `npm run lint:probe` proves it).
  Shared code goes down to `src/`.
- Deleting a row uses `useDeleteDialog` from `src/hooks` (it wraps `useDeleteTarget`).
- The full recipe for a new entity, with every file outside the folder, is in
  STRUCTURE.md ("إضافة كيان جديد").
