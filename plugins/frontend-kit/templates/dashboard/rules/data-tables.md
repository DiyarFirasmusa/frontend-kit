---
paths:
  - "src/components/table/**"
  - "src/features/**/components/*-columns.tsx"
  - "src/features/**/hooks/use-list-page.ts"
  - "src/features/**/hooks/*-actions.ts"
  - "src/utils/table-*.ts"
---

# Data tables (TanStack Table, server-driven)

Every list is the shared `<DataTable>` from `src/components/table/`, built on
TanStack Table v9 (`useTable` + `tableFeatures`). A feature never calls
`useTable` itself; it supplies columns, rows, the row count and the URL state.
Skill: `dash-create-table`.

## The server does the work

The backend pages, sorts and filters. The table only renders one page.

- `manualPagination` and `manualSorting` are always `true`. Filters are not
  table state at all: they live in the URL and go straight into the query params.
- `rowCount` comes from the response total (`totalElements`, `total`…); the
  table derives the page count from it. Unknown total → `pageCount: -1`.
- `state.pagination` and `state.sorting` are **derived from the URL**
  (`routing.md`). `onPaginationChange` / `onSortingChange` resolve the updater
  with `functionalUpdate` and navigate; they never set local state.
- Page index is 0-based in the table, 1-based in the URL; convert in one
  helper (`src/utils/table-state.ts`), not inline.
- Sort in the URL is one string (`name.asc`); `toSortingState` /
  `toSortParam` convert both ways, and the service maps it to the backend's
  format (`sort=name,asc`, `orderBy=…`). Single-column sort unless the backend
  supports more.
- Query: `placeholderData: keepPreviousData`, so the old page stays while the
  next one loads; show the refetch as a thin progress bar, not a skeleton.
- `getRowId: (row) => row.id`, never the index: selection must survive a refetch.

## Columns

- One pure factory per entity: `getXColumns({ t, locale, getActions })` in
  `components/<entity>-columns.tsx`, built with
  `createColumnHelper<DataTableFeatures, XRow>()` and `helper.columns([...])`.
  Memoised in the page hook on `[t, locale, getActions]`.
- Column `id` = the backend sort key when sortable, so the URL sort maps straight
  through. `enableSorting: false` on everything the backend cannot sort.
- Header text via `t()`; cells render `'—'` for null / empty.
- Dates and numbers through the shared formatters with the active locale, in
  `tabular-nums`; ids and codes `font-mono`, `dir="ltr"`.
- Status cells: a `Record<Status, Tone>` map + a translated label, never colour alone.
- Column extras (alignment, width, sticky) go in `meta`, typed once by
  augmenting `ColumnMeta` in `src/types/table.ts`.

## States

The toolbar, filters and header render in every state; only the body changes.

| State            | Body                                                              |
| ---------------- | ----------------------------------------------------------------- |
| First load       | Skeleton rows, `pageSize` of them, same column widths (no shift)  |
| Refetch          | Previous rows + a progress bar, `aria-busy="true"` on the table   |
| Error            | Inline error row with the standard retry → `query.refetch()`      |
| Empty, no filter | Empty state with the create action (when permitted)               |
| Empty, filtered  | "No results" + a "clear filters" button that resets the URL       |

Page past the end (rows empty, page > 1): navigate to the last valid page.

## Row actions

- Pure `getXRowActions(row, { can, onEdit, onDelete })` in
  `hooks/<entity>-actions.ts` returning a typed `RowAction[]`; unit-test it.
- Inline icon buttons for one or two actions, a menu beyond that. Every icon
  button has an `aria-label` that names the row (`t('users.editRow', { name })`).
- An action the user lacks permission for is not rendered. An action not
  allowed for this row's state is disabled with a reason in a tooltip.
- Row click opens the detail page only when there is one; the row is then a
  real link (`<Link>` in the primary cell), not a clickable `<tr>`.

## Bulk actions

- Only when the backend has a bulk endpoint. Selection uses `rowSelectionFeature`,
  a checkbox column and `getRowId`.
- Selection is the current page only and clears on page, filter or sort change.
  Say so in the bar ("3 selected on this page").
- The bulk bar appears above the table with the count, the actions and "clear".
- Destructive bulk actions confirm with the count, are single-flight, then
  clear the selection and invalidate the list.

## Accessibility

- A real `<table>` with `<caption>` (visually hidden if needed), `<th scope="col">`.
- Sortable headers are `<button>`s inside the `<th>`; the `<th>` carries
  `aria-sort="ascending" | "descending" | "none"` from `getIsSorted()`.
- Checkboxes have labels ("Select row …", "Select all on this page") and the
  header checkbox shows `indeterminate` from `getIsSomePageRowsSelected()`.
- Pagination is a `<nav aria-label>`, with the current page `aria-current="page"`
  and a live region announcing "page 2 of 9, 180 results".
- Keyboard: tab reaches every control in visual order; no focus traps in rows.

## RTL and layout

- Logical properties only: `text-start`, `ps-*`, `pe-*`, `start-0` for sticky
  columns. Numbers stay `text-end` in both directions.
- Pagination arrows flip in RTL (`rtl:-scale-x-100`, the same utility as every other directional icon); "next" still means the
  next page.
- Wide tables scroll inside their own container (`overflow-x-auto`) with the
  first column sticky at `start-0`; the page itself never scrolls sideways.
- On phones, keep the key columns and hide the rest with column visibility, or
  render the same rows as cards. Touch targets ≥ 44px.


## Selection, visibility and server pages

- With `manualPagination`, `table.getIsAllPageRowsSelected()` is wrong (false while every visible row is selected).
  Derive the header checkbox from `table.getRowModel().rows` (`rows.every((row) => row.getIsSelected())`).
- Clear selection from the page/filter/sort **key** (a `useRowSelection(resetKey)` that derives "empty" when the key
  changes), not from an effect that watches them.
- Column visibility: a menu on the table toolbar, persisted per table (a small store keyed by table id), default
  columns visible on desktop, the essential ones only on phones.
- Non-delete bulk actions (status change) show a result dialog: how many updated, how many skipped and why.
- Export covers the **filtered set**, not the page; the file comes from the blob path in `api-layer.md`.
- Inline toggles update optimistically and roll back on error.

## Don't

- No client-side sorting or slicing of a server page.
- No `useState` for page, sort or filters; no `useEffect` to sync them.
- No inline column arrays in the container; no `useTable` in a feature.
- No index-based row ids.
