---
name: dash-create-table
description: Dashboard profile - build a list page or data table on TanStack Table with server-side pagination, sorting and URL-synced filters, column factory, row actions, bulk selection, loading, error and empty states. Use for a list, table, index page, 'show all X', sorting, pagination, bulk delete.
---

# Dashboard: create a table

**Where do global folders live?** If `.claude/rules/structure.md` exists (the Next.js and TanStack Start variants), its path map
renames the global folders and the feature's `services/` (Start: `src/shared/…`, `api/<entity>.api.ts`; Next: `layouts/`,
`modals/`, `wrappers/`). Use its names wherever this skill says `src/components/…`, `src/api/…` or `services/`.

Rules this follows: `.claude/rules/data-tables.md`, `.claude/rules/routing.md`,
`.claude/rules/api-layer.md`, `.claude/rules/permissions.md`.
Shared table component: `references/data-table.md`. Feature files, end to end:
`references/list-feature.md`.

## 0. Gather

- The list endpoint from `docs/api/openapi.json`: paging params and response
  shape (`content` / `totalElements`, `items` / `total`…), which fields the
  backend can sort by, which filters it accepts. Mirror them; don't invent.
- Columns to show (in order) and which are hidden on phones.
- Row actions and the permission for each; is there a detail page?
- Bulk actions: only if the backend has a bulk endpoint.

Missing sort or filter support on the backend → say so (`backend-request`
skill) instead of sorting or filtering the current page on the client.

## 1. Shared table exists?

`src/components/table/data-table.tsx` and `table-features.ts` present? If not,
create them from `references/data-table.md` first (once per project), with tests.

## 2. Feature files, in order

All under `src/features/<group>/<entity>/`:

1. `types/types.ts` — `XRow`, `XListParams`, `XListResponse` from the spec.
2. `validations/search.ts` — page, pageSize, sort, q, filters (`dash-create-route`,
   `dash-create-filter-bar`).
3. `utils/list-params.ts` — `toXListParams(search): XListParams`.
4. `services/<entity>.service.ts` — `fetchXs(params)` mapping to backend names.
5. `qk.<entity>` in `src/constants/query-keys.ts`; `hooks/query/use-<entity>-list.ts`
   exporting `xListQueryOptions(params)` + `useXList(params)` with
   `placeholderData: keepPreviousData`.
6. `hooks/<entity>-actions.ts` — pure `getXRowActions(row, { can, … })`.
7. `components/<entity>-columns.tsx` — `getXColumns({ t, locale, getActions })`
   with `createColumnHelper<DataTableFeatures, XRow>()`.
8. `hooks/use-list-page.ts` — reads search via `getRouteApi` (Next.js: `useListSearch`, see `dash-create-route/references/next-routes.md`), derives
   `pagination` / `sorting`, builds columns, writes the URL on change.
9. `index.tsx` — default export `XListContainer`: header, filter bar, bulk bar,
   `<DataTable>`. JSX plus one `useXListPage()` call.
10. `locales/{ar,en}.json` — title, caption, column headers, empty, no results,
    row action labels, bulk labels. Both languages.
11. Route file (`dash-create-route`) and nav entry.

## 3. The container shape

```tsx
export function UsersListContainer() {
  const page = useUsersListPage();
  return (
    <section className="space-y-4">
      <PageHeader title={page.t('users.title')} actions={page.createAction} />
      <UsersFilterBar />
      <DataTable
        caption={page.t('users.caption')}
        columns={page.columns}
        rows={page.rows}
        rowCount={page.rowCount}
        getRowId={getUserRowId}
        pagination={page.pagination}
        sorting={page.sorting}
        onPaginationChange={page.setPagination}
        onSortingChange={page.setSorting}
        status={page.status}
        onRetry={page.retry}
        empty={page.empty}
      />
    </section>
  );
}
```

## 4. States (all designed)

First load = skeleton rows; refetch = previous rows + progress bar; error =
inline row with retry; empty without filters = message + create action;
empty with filters = "no results" + clear filters. Header, toolbar and
filters render in every state.

## 5. Tests

- `utils/list-params.test.ts`, `hooks/<entity>-actions.test.ts` — pure units,
  every permission and row state.
- `components/<entity>-columns.test.tsx` — headers translated, `'—'` for empty
  cells, sortable columns are exactly the backend's sort keys.
- `index.test.tsx` with MSW: loading, error + retry, empty, success; clicking
  a sortable header and "next page" changes the request params and the URL.
- e2e: list → sort → next page → back keeps state; add the page to the a11y spec.

## 6. Check by eye

Arabic RTL and English LTR, phone and desktop, light and dark: sticky first
column on the start side, pagination arrows flipped, no horizontal page
scroll, no layout shift between skeleton and rows. Then `verify`.

## Don't

- No `useTable` in a feature; no client-side sort or slice of a server page.
- No `useState` for page / sort / filters; no effect syncing them.
- No inline column array in the container; no index row ids.
