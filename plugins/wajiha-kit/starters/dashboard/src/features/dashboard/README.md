# src/features/dashboard

One folder per backend resource. **`suppliers/` is the reference entity**: it
follows the kit's dashboard rules exactly (URL-owned list state, server paging
and sorting, TanStack Table, shared `queryOptions`, cancellation, one dialog
union, edit loaded by id, backend field errors on the inputs, delete confirm,
reactive permissions). Copy it for a new entity.

```text
src/features/dashboard/suppliers/
├── index.tsx                               → the list page: JSX and one useSuppliersListPage() call
├── hooks/use-list-page.ts                  → reads the URL, builds columns, wires table, dialog, delete
├── hooks/filter/use-supplier-filters.ts    → reads/writes filters in the URL (page back to 1)
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

The other demos are older shapes kept as references for things suppliers does
not show: `warehouses/` (detail page with tabs, members, audit log),
`categories/` (tree, inline toggles, a second route), `units-of-measure/`,
`home/` (a read-only page of widgets). Their lists still page on the client
(`ClientDataTable`, `useState` filters); do not copy that part. Move them to
the suppliers shape when you touch them.

Rules that keep it small:

- A file lives in the deepest folder that contains every importer. Move it to
  `src/` when a second feature needs it, not before.
- A feature never imports another feature. Shared code goes down to `src/`.
- Deleting a row uses `useDeleteTarget` from `src/hooks`.
- The full recipe for a new entity, with every file outside the folder, is in
  STRUCTURE.md ("إضافة كيان جديد").
