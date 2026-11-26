---
paths:
  - 'src/features/**/components/dialog/**'
  - 'src/features/**/hooks/form/**'
  - 'src/features/**/hooks/query/use-*-mutations.ts'
  - 'src/features/**/validations/**'
  - 'src/components/dialog/**'
  - 'src/components/fields/**'
  - 'src/hooks/use-delete-dialog.ts'
---

# Forms and CRUD

Create, edit and delete follow the shape of `features/dashboard/suppliers`; copy
it and edit.

- **One dialog serves create and edit.** Which dialog is open is the page hook's
  single union (`{ kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; id }`),
  never several booleans. The dialog is rendered with a `key` of mode plus id, so
  each opening starts clean.
- **Edit loads the record by id** (the detail query, not the row object) and the
  form fills through react-hook-form's `values` with `keepDirtyValues`. The body
  shows a skeleton while loading and an inline error if it fails; submit stays off
  in both cases (`canSubmit`).
- **Schema** (`validations/validations.ts`): `xSchema` (zod 4), `XValues`,
  `defaultXForm`, `toXPayload(values)`, `toXFormValues(detail)`, and the list of
  field names for `applyApiFieldErrors`. The mappers are pure and unit-tested;
  messages are i18n keys in both languages.
- **Submit is single-flight**: the handler returns early while a mutation is
  pending or the record is loading, so Enter and double clicks send once. The
  `FormDialog` blocks Escape and the overlay while pending.
- **Errors**: the client already toasted the summary; the form maps a 400/422's
  field messages onto the inputs with `applyApiFieldErrors(error, setError,
FIELDS)` and keeps the user's input. A form never toasts.
- **Mutations** live in `hooks/query/use-x-mutations.ts`, are never called from a
  component directly, invalidate in `onSuccess` and **return the promise** so
  `isPending` lasts until the list has refetched. Delete removes the detail query
  before invalidating `lists()`. Success toasts come from `successMessage` on the
  service request. Optimistic updates only for single-row toggles.
- **Delete** is always a `ConfirmDialog` that names the record, starts focus on
  Cancel, stays open until the request settles and closes on success only
  (`useDeleteDialog` wires this).
- Every input has a visible label; required is marked in text; phones, codes and
  emails are `dir="ltr"` inside RTL forms.

Not in the starter: a dirty-form discard prompt, optimistic locking and field
arrays. Add them when a real form needs them, and note it here.
