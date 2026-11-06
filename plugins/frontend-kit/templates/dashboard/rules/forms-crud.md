---
paths:
  - "src/features/**/components/dialog/**"
  - "src/features/**/hooks/form/**"
  - "src/features/**/hooks/query/use-*-mutations.ts"
  - "src/features/**/validations/**"
  - "src/features/**/pages/create/**"
  - "src/features/**/pages/edit/**"
  - "src/components/dialog/**"
  - "src/components/fields/**"
---

# Forms and CRUD

Create, edit and delete follow one shape in every feature. Form mechanics
(react-hook-form + zod 4, field wrappers, inline errors) are in the shared
`create-form` skill; this rule decides the dashboard-specific parts.
Skill: `dash-create-crud`.

## Dialog or page

| Use a dialog when                                  | Use a page (`pages/create`, `pages/edit`) when       |
| -------------------------------------------------- | ---------------------------------------------------- |
| up to ~8 fields, one column, no sub-lists          | sections, tabs, nested rows, file uploads            |
| the user stays on the list afterwards              | the user goes to the new record afterwards           |
| no deep link is needed                             | the form must be linkable or survive a reload        |

- One dialog serves create and edit: `mode: { kind: 'create' } | { kind: 'edit'; id: string }`.
  Which dialog is open is page-hook state, a single union, not three booleans.
- Edit loads the record by id with the detail query (not the possibly stale
  row object) and resets the form once data arrives: `values` option or
  `reset(toFormValues(detail))` keyed by id. Show a skeleton in the dialog body
  until then; the submit stays disabled.
- Closing a dirty form asks to discard. `Esc` and the backdrop follow the same rule.

## Schema and values

- `validations/validations.ts`: `xSchema`, `XFormValues`, `defaultXForm`,
  `toXPayload(values)` and `toXFormValues(detail)`. The two mappers are pure and
  unit-tested; the backend payload and the form shape are allowed to differ.
- Messages are i18n keys in both `ar` and `en`.
- Backend validation errors (400/422 with field details) are mapped onto the
  fields with `setError` in the form hook, through one shared helper; the
  client still toasts the summary.

## Submit

- **Single-flight.** The submit button is disabled and shows progress while
  `mutation.isPending`; the handler returns early if a mutation is pending, so
  Enter and double clicks cannot send twice.
- Submission goes through a mutation hook in `hooks/query/`. Never call the
  service from a component; never toast (the client does).
- On success: close the dialog (or navigate), then the mutation's
  `onSuccess` invalidates. On error: keep the form open with the user's input.

## Invalidate or optimistic

- **Default: invalidate.** `onSuccess: () => qc.invalidateQueries({ queryKey: qk.x.all })`.
  Correct for anything the server computes (totals, ordering, audit fields, paging).
- **Optimistic** only for small, reversible, single-row toggles (active flag,
  pin, archive) where the server result is predictable:
  `onMutate` cancels `qk.x.all`, snapshots the affected list/detail, patches
  them; `onError` restores the snapshot; `onSettled` invalidates. Never
  optimistic for create, delete of a paged row, or anything with side effects.
- After create on page N, invalidating is enough; do not insert the new row
  into a cached page.

## Delete

- Always `ConfirmDialog`: names the record (`t('users.deleteConfirm', { name })`),
  says if it cannot be undone, destructive styling, focus starts on **Cancel**.
- The confirm button is single-flight and the dialog stays open until the
  request settles; close on success, stay open on error.
- After deleting the last row on a page > 1, go back one page.
- Bulk delete confirms with the count and uses the bulk endpoint, never a loop
  of single deletes from the client.

## Accessibility and direction

- Dialogs are the base-ui primitives: labelled title, focus trapped, focus
  returns to the opener on close.
- Every input has a visible `<label>`; required fields are marked in text,
  not colour only; errors are linked with `aria-describedby`.
- Phone, email, codes and numbers are `dir="ltr"` inputs inside RTL forms.
- Footer buttons use logical order: primary at the inline end in both directions.

## Don't

- No `watch()` re-render storms; use `useWatch` for dependent fields.
- No form state copied into Zustand or the URL.
- No `setTimeout` to wait for a refetch before closing.
