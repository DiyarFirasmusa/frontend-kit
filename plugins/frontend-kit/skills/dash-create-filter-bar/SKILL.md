---
name: dash-create-filter-bar
description: "Dashboard profile: add a filter bar / toolbar above a list — debounced search box, status or enum selects, lookup selects (role, category), date range, toggles, active-filter count and clear-all — with every value stored in typed URL search params and the page reset to 1 on change. Use when the user asks for filters, search, a search box, filter by status / date / type, a toolbar, \"filter the table\", clear filters, or to keep filters after reload / in a shared link."
---

# Dashboard: create a filter bar

**Where do global folders live?** If `.claude/rules/structure.md` exists (the Next.js and TanStack Start variants), its path map
renames the global folders and the feature's `services/` (Start: `src/shared/…`, `api/<entity>.api.ts`; Next: `layouts/`,
`modals/`, `wrappers/`). Use its names wherever this skill says `src/components/…`, `src/api/…` or `services/`.

Rules this follows: `.claude/rules/routing.md` (search params are the state),
`.claude/rules/data-tables.md` (empty vs no-results states). Component and
hook code: `references/filter-bar.md`.

## 0. Gather

- Which filters the **backend** accepts for this list (names, enum values,
  date format, multi-value support). Only build filters it supports; anything
  missing goes to `backend-request`, never a client-side filter of one page.
- Per filter: control type, default (the "all" value), where the options come
  from (static enum or a lookup endpoint).
- Which filters stay visible on phones (search usually) and which go in the
  collapsible panel.

## 1. Schema first

Add each filter to `validations/search.ts`, with `.catch()` and a default:

```ts
status: z.enum(['all', ...USER_STATUSES]).catch('all').default('all'),
roleId: z.string().catch('').default(''),
from: z.iso.date().optional().catch(undefined),
to: z.iso.date().optional().catch(undefined),
```

- The "all" option is the default and is stripped from the URL.
- Dates are `YYYY-MM-DD` strings; the service converts to what the backend wants.
- Multi-select: `z.array(z.string()).catch([]).default([])`.
- Extend `toXListParams` so the new fields reach the query key and the request.

## 2. Filters hook — `hooks/filter/use-<entity>-filters.ts`

One hook owns reading and writing filters:

- `values` — the current filter fields from `routeApi.useSearch()`.
- `setFilters(patch)` — `navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })`;
  `replace: true` for text search so typing does not fill history.
- `clear()` — every filter back to its default, page 1, sort kept.
- `activeCount` — filters that differ from the defaults (search text excluded
  or included, decide once per project).

## 3. Components

Shared ones in `src/components/filters/` (create once, test once):
`FilterBar`, `SearchField` (debounced 400 ms, keeps its text in sync when the
URL changes from outside), `FilterSelect`, `DateRangeFilter`.
The feature composes them in `components/<entity>-filter-bar.tsx`, which calls
only the filters hook and a lookup query when needed.

## 4. Behaviour

- Any change → page 1, selection cleared, sort kept.
- Lookup selects show a disabled loading state, then options; a failed lookup
  shows the select with a retry, the rest of the bar keeps working.
- Date range: `to` cannot be before `from` (`min` on the input + the schema
  ignores an inverted range).
- "Clear filters" appears only when `activeCount > 0`, and also inside the
  table's no-results state.
- Back / forward walk through filter states; a reload or a shared link shows
  the same filtered list.

## 5. Accessibility and direction

- The bar is a `<search>` element (or `role="search"`) with an accessible name.
- Every control has a visible label (or `aria-label` for the search box with
  a visible search icon); the clear-search button has a label.
- The phone "Filters (2)" button has `aria-expanded` and `aria-controls`.
- Result changes are announced once by the table's live region, not per keystroke.
- Logical properties only: search icon at `start`, clear button at `end`;
  date inputs `dir="ltr"`. Touch targets ≥ 44px.

## 6. Tests

- `validations/search.test.ts`: invalid values fall back; defaults strip.
- `hooks/filter/use-<entity>-filters.test.ts`: `setFilters` resets page;
  `clear` keeps sort; `activeCount` counts only non-defaults.
- `SearchField` (once): one call after 400 ms of typing (fake timers); external
  value change updates the text.
- List integration (MSW): choosing a status sends `status=…` and shows
  no-results + clear when empty; clear restores the full list.
- e2e: filter → reload → same results; back button restores the previous filter.

## Don't

- No filter state in `useState` / Zustand; no effect syncing URL ↔ state.
- No client-side filtering of a server page.
- No request per keystroke (debounce), no history entry per keystroke (`replace`).
