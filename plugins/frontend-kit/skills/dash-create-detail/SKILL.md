---
name: dash-create-detail
description: "Dashboard profile: add a detail page for an entity — header with status and permission-gated actions, tabs kept in the URL, sections (summary, items, history/notes), state transitions with confirm, and optimistic-locking conflict handling. Use when the user asks for a details / view / show page, an order or user page, a record with history, notes or status changes, or 'open the row'."
---

# Dashboard: detail page with actions

**Where do global folders live?** If `.claude/rules/structure.md` exists (the Next.js and TanStack Start variants), its path map
renames the global folders and the feature's `services/` (Start: `src/shared/…`, `api/<entity>.api.ts`; Next: `layouts/`,
`modals/`, `wrappers/`). Use its names wherever this skill says `src/components/…`, `src/api/…` or `services/`.

Rules this follows: `.claude/rules/routing.md`, `.claude/rules/permissions.md`,
`.claude/rules/forms-crud.md` (conflicts), `.claude/rules/api-layer.md`.
Route wiring: `dash-create-route`. Edit forms: `dash-create-crud`.

## 0. Gather

- The entity, its detail endpoint, and which actions the backend really offers (status change, notes, delete).
- Does the backend return the **allowed transitions**? If not, say so (scope.md, `backend-request`) and mirror the
  state machine in one pure file `utils/transitions.ts`; never scatter status checks through components.
- Does it return `updatedAt` / a version for optimistic locking? Same rule: report it if missing.
- Which tabs (if any) and which permission each action needs (`canX(row, perms)` in `hooks/<entity>-actions.ts`).

## 1. Files

```text
features/<group>/<entity>/pages/detail/
├── index.tsx                  container: JSX + one useDetailPage()
├── hooks/use-detail-page.ts   route params + search (tab), detail query, actions, dialogs
├── hooks/query/               <entity>DetailQueryOptions, status/note mutations
├── components/                header, summary, items table, history, transition dialog
└── utils/transitions.ts       allowed next states per current state (pure)
```

## 2. Steps

1. **Route**: `$<entity>Id/index.tsx`, loader `ensureQueryData(detailQueryOptions(id))`, a 404 from the API becomes
   `notFound()`. `validateSearch` owns `tab` (`z.enum([...]).catch('summary').default('summary')`, stripped).
2. **Page hook**: reads params with `getRouteApi` (Next.js: `useParams` + zod), `useSuspenseQuery(detailQueryOptions(id))`, derives `actions` with
   `getDetailActions(detail, perms)`. The container never calls `can()`.
3. **Header**: title, status badge (one `StatusBadge` with a static `Record<Status, string>` of `t()` keys), and the
   actions as buttons. A role that may view but not act sees the page without buttons plus no notice noise.
4. **Transitions**: each opens a confirm dialog naming the new state; single-flight; on success `setQueryData` with
   the returned record and invalidate the list key. Illegal transitions are never rendered, not disabled.
5. **Conflicts**: send `expectedUpdatedAt`; on 409 stale open the conflict dialog from `forms-crud.md` (load latest /
   overwrite / keep editing). Mutations handling 409 set `silentErrorStatuses: [409]`.
6. **History and notes**: one timeline component; a note and a transition render differently. If the backend mixes them
   in one list with no type, report it.
7. **Loading/error/empty**: the `<Wrapper>` for each section that can fail on its own; sections do not block each other.
8. **Locales**: group `<entity>` in both languages; statuses and actions as static keys.

## 3. Checklist

- [ ] Guard on the route and `canX` on every action; a viewer opens the page and sees no mutating control
- [ ] Tab in the URL; reload and share work
- [ ] 409 path tested (MSW returns the stale error once)
- [ ] Transition table has a unit test (every state's allowed set)
- [ ] RTL and LTR, phone width; `verify` passes
