---
name: dash-create-settings-form
description: Dashboard profile - add a settings or profile page - one form of grouped sections saved with a single PATCH or PUT, loaded from a singleton endpoint, optimistic locking, unsaved-changes guard, read-only sections by permission. Use for a settings page, preferences, site config, a profile page.
---

# Dashboard: settings form

**Where do global folders live?** If `.claude/rules/structure.md` exists (the Next.js and TanStack Start variants), its path map
renames the global folders and the feature's `services/` (Start: `src/shared/…`, `api/<entity>.api.ts`; Next: `layouts/`,
`modals/`, `wrappers/`). Use its names wherever this skill says `src/components/…`, `src/api/…` or `services/`.

Rules this follows: `.claude/rules/forms-crud.md` (conflicts, dirty guard, arrays),
`.claude/rules/permissions.md` (read-only mode), `.claude/rules/api-layer.md`.
Field mechanics: the shared `create-form` skill. Route: `dash-create-route`.

## 0. Gather

- The singleton endpoint (`GET /settings`, `PATCH /settings`) and its sections; which fields each permission may edit.
- Does it have `updatedAt` / a version? If not, report it: two admins will overwrite each other.
- Which fields are secrets or write-only (never prefill a secret; send it only when changed).

## 1. Files

```text
features/<group>/settings/
├── index.tsx                  container: sections + sticky save bar
├── hooks/use-settings-page.ts query, form, dirty guard, submit
├── validations/settings.ts    zod schema; superRefine mirrors the server's cross-field rules
├── utils/settings-form.ts     toFormValues(detail) / toPayload(values, dirtyFields)
└── components/                one component per section (fieldset)
```

## 2. Steps

1. Load with `useSuspenseQuery`; mount the form with `key={detail.updatedAt}` so a refetch never clobbers typing.
2. `toFormValues` turns numbers into strings and nulls into `''`; `toPayload` sends **only dirty fields** so a role
   that edits one section cannot overwrite the others.
3. Sections are `<fieldset disabled={!canEditSection}>`; components that ignore fieldset get `disabled` too. A section
   the role cannot edit shows the read-only notice; a role with no edit permission at all gets no save bar.
4. One save bar for the whole page: disabled until dirty, single-flight, shows pending, then a saved confirmation
   (the toast comes from the mutation client). Unsaved-changes guard (`use-unsaved-changes-guard`) on navigation.
5. Send `expectedUpdatedAt`; on 409 stale use the conflict dialog; on success `setQueryData` the response and reset
   the form to it.
6. Backend field errors go through `applyApiFieldErrors`, including dotted paths for array rows.

## 3. Checklist

- [ ] Dirty-only payload test; secrets never prefilled
- [ ] Read-only role test: no save bar, every control disabled
- [ ] 409 and dirty-guard paths tested; RTL/LTR; `verify` passes
