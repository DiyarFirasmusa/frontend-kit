---
name: refactor
description: Refactor code without changing behaviour — split long files, separate view, state, data and logic, apply the project's own layout, extract services and hooks or their equivalents, remove duplication, finish JS→TS leftovers. Use when asked to clean up, restructure, split, simplify or migrate code.
---

# Refactor

Change structure, not behaviour. If behaviour must change too, that is a
separate task. The principles are fixed; the target folders, names and libraries are the project's
(`project.md`, the nearest code), and changing those needs the user's choice.

## Golden rules

1. Tests first: make sure the code you touch is covered (add an integration
   test with MSW if it isn't) so you can prove nothing changed.
2. Small steps; the project's typecheck, lint and tests (`commands`, else its
   package scripts) after each one.
3. One kind of change at a time (move, rename, extract) — don't mix.
4. Delete what is dead; no commented-out code, no re-export shims.
5. Stop and ask before touching generated files (the API types,
   `src/routeTree.gen.ts`) or deploy config (`.github/`, `deploy/`, and any
   other path `CLAUDE.md` lists as protected).

## Smells → fixes

In every stack: a view that fetches, stores or calculates → move that out; two jobs in one file → split; a copy → one
owner; an import cycle → move the shared part down. The table shows the same in React + TanStack, as examples: use the
project's equivalent, and don't bring one of those libraries in.

| Smell | Fix |
| ----- | --- |
| Route component / container with `useState` / `useEffect` / queries | move into `use-<page>-page.ts`; the component = JSX + one hook |
| File > 500 lines | page hook + `components/` + `utils/<topic>.ts`, split by concern |
| HTTP call inside a hook or component | a `services/<entity>.service.ts` function + a query hook |
| `useEffect` + fetch | `useQuery` (or the route `loader` + `queryClient.query()`) |
| Inline key array / URL | the query-key factory / the endpoint constants |
| Toast or try/catch around an API call | remove when the API client toasts; use its opt-out flag if the flow owns the error UI |
| Same component in two features | promote to the shared components folder |
| Same query hook in two features | the shared query-hooks folder |
| Server data copied into Zustand | read from the query cache |
| Hardcoded hex / `[[dir=rtl]_&]:pl-*` pairs | semantic token / one logical utility |
| Clickable `div` with `navigate()` | `<Link>` |
| Search state in `useState` that should survive a reload | `validateSearch` + `Route.useSearch()` |
| Untyped props, `any`, implicit `any` from JS days | an interface; `unknown` + narrowing |
| Magic numbers (OTP length, page size, limits) | named constants |
| Nested conditionals | guard clauses, early returns |
| Strings in JSX | `t('group.key')` in each language the project ships |

## Moving files

`git mv old new`, then update every importer (search the old path and the
exported names; multi-line imports too). Relative imports inside a feature,
the `@/…` alias across. The destination follows the layout in `CLAUDE.md` /
`.claude/rules/` — a file lives in the deepest folder that contains every
file that imports it. Route files under `src/routes/` keep TanStack Router's
file naming; moving one changes its URL, so that is a behaviour change.

## Done when

Every `verify` gate is green, the touched pages look and behave the same in
each language on phone and desktop, and the diff
contains no behaviour change. Ask the user before any commit.
