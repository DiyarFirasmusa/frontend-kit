---
paths:
  - 'src/components/table/**'
  - 'src/features/**/components/*-columns.tsx'
  - 'src/features/**/hooks/use-list-page.ts'
  - 'src/features/**/hooks/*-actions.ts'
  - 'src/utils/table-state.ts'
---

# Data tables (TanStack Table, server-driven)

Every list is the shared `<DataTable>` (`src/components/table/data-table.tsx`) on
TanStack Table v9. A feature never calls `useTable`; it passes columns, rows, the
total and the URL state, and gets a table back.

- **The server pages and sorts.** `manualPagination` and `manualSorting` are on;
  `rowCount` is the response's `totalElements`. Filters are not table state: they
  live in the URL (`routing-url-state.md`) and go into the query params.
- **Pagination and sorting come from the URL.** `useListSearch` derives them with
  `toPaginationState` / `toSortingState` (`utils/table-state.ts`, the only place
  that converts the 1-based URL page to the 0-based `pageIndex`). `DataTable`
  resolves TanStack's updaters with `functionalUpdate` and hands the result up; no
  `useState` for page, sort or filters. A page past the end is clamped by
  `useClampPage`.
- `getRowId` is the record id, never the index. `rows` keeps its identity: the
  query's array or a module-level `NO_ROWS`, not `data ?? []` inline.
- **Columns** are one pure factory per entity, `getXColumns({ t, getActions })`,
  built with `createColumnHelper<DataTableFeatures, XRow>()` and memoised in the
  page hook. A sortable column's `id` is the backend sort key; everything else has
  `enableSorting: false`. Empty cells render `'—'`; codes and phones are `dir="ltr"`.
  Layout extras (`align`, `hideBelow`) go in `meta`, typed in `src/types/table.ts`.
- **States**: `toTableStatus(query)` gives `loading` (skeleton rows), `refetching`
  (old rows plus a thin bar, `aria-busy`), `error` (inline retry) or `ready`. The
  empty row says "nothing yet" or "no results" and offers create or clear filters.
- **Row actions** are a pure `getXRowActions(row, { t, can, ... })` returning
  `RowAction[]` (unit-tested). An action the user may not do is not rendered. An
  action allowed in general but refused for this row carries `disabledReason`: it
  stays focusable (`aria-disabled`), shows the reason, and selecting it does
  nothing. Every label names the row (`suppliers.actions.editRow`).
- **Delete** goes through `useDeleteDialog` and `ConfirmDialog`; the page hook owns
  the single `dialog` union state for create/edit.
- **Export** (`useListExport`) covers the filtered set, not the page on screen, and
  warns with the real row cap when the backend cut it.
- RTL: logical properties only (`text-start`, `ps-*`, `end-0` for the sticky
  actions column); wide tables scroll inside their own container.

Don't: sort or slice a server page on the client, add `useState` for list state,
use index row ids, or inline a column array in the container.
