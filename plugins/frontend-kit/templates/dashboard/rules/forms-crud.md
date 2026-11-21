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
  - "src/hooks/use-unsaved-changes-guard.ts"
  - "src/shared/components/dialog/**"
  - "src/shared/components/fields/**"
  - "src/components/modals/**"
  - "src/shared/hooks/use-unsaved-changes-guard.ts"
---

# Forms and CRUD

> Paths below are the default layout. A project with `.claude/rules/structure.md` (the Next.js and TanStack Start variants)
> reads them through that file's path map (`src/shared/…`, `layouts/`, `api/client/`, …).

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


## Edit pages: conflicts and unsaved changes

**Optimistic locking** (when the backend has `updatedAt` / a version and rejects stale writes):

- Mount the form with `key={detail.updatedAt}` instead of resetting it from a refetch: a background refetch must not
  clobber what the user is typing.
- Send `expectedUpdatedAt` with the update; on success `setQueryData` the returned record.
- On a 409 stale error open a conflict dialog with three outcomes: load the latest (discard my edits), overwrite
  (resend with the newest timestamp), keep editing. The client treats that status as handled
  (`silentErrorStatuses: [409]`), so no generic error toast fires.
- Report a backend that offers no such check (scope.md); do not fake one.

**Dirty-form guard** (pages; dialogs just confirm on close): block in-app navigation and tab close while the form is
dirty (`useBlocker({ shouldBlockFn, enableBeforeUnload, withResolver: true })`), with a bypass for the navigation
that follows a successful save or create. One shared hook (`use-unsaved-changes-guard`), not one per form.

**Field arrays, uploads, cross-field rules:**

- `useFieldArray` for repeating rows (variants, addresses); keep a stable id per row, never the index, as key.
- Numbers are strings in the form and parsed once in `toXPayload`; the schema (`superRefine`) mirrors the server's
  cross-field rules (end after start, unique SKUs) so the user sees them before the round trip.
- Uploads: multipart through the same client, a preview from the response URL, progress only if the API gives it.
- `applyApiFieldErrors(error, setError, translate)` maps **every** key of the backend's `errors` object, including
  dotted array paths (`variants.1.sku`); backend values are codes or English text, so translate them per field. The
  single `field as Path<T>` cast inside this one helper is the allowed exception to the no-cast rule.

## Don't

- No `watch()` re-render storms; use `useWatch` for dependent fields.
- No form state copied into Zustand or the URL.
- No `setTimeout` to wait for a refetch before closing.
