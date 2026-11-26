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
- **Submit is single-flight**: the handler returns early when the record is
  loading or `useSingleFlight().start()` says a request is already out, and the
  mutation's `onSettled` is `flight.end` (`src/hooks/use-single-flight.ts`). Do not
  guard on `mutation.isPending`: it is a render-time value, still false for the
  first few milliseconds, so three quick Enters or a scripted double click all pass
  it. Every submit (entity forms, the attach and options dialogs, add member,
  `useDeleteDialog`) uses the hook; `lib/mutation-conventions.test.ts` fails when
  one does not. The `FormDialog` blocks Escape and the overlay while pending.
- **Errors**: the client already toasted the summary; the form maps a 400/422's
  field messages onto the inputs with `applyApiFieldErrors(error, setError,
FIELDS)` and keeps the user's input. A form never toasts.
- **Mutations** live in `hooks/query/use-x-mutations.ts`, are never called from a
  component directly, invalidate in `onSuccess` and **return the promise** so
  `isPending` lasts until the list has refetched. Delete calls `forgetQueries(qc,
[the record's keys])` (`src/lib/forget-queries.ts`: cancels what is in flight, drops
  what nobody watches) and then invalidates `lists()`. Never `removeQueries` a key a
  mounted component still watches (the selected category's assignments table): the
  observer would create and fetch it again, and the 404 toasts "Record not found".
  When the deleted record is the selected one, also move the selection off it in the
  same `onSuccess` (`useDeleteCategory(onDeleted)`). Success toasts come from
  `successMessage` on the service request. Optimistic updates only for single-row
  toggles.
- **Delete** is always a `ConfirmDialog` that names the record, starts focus on
  Cancel, stays open until the request settles and closes on success only
  (`useDeleteDialog` wires this).
- Every input has a visible label; required is marked in text; phones, codes and
  emails are `dir="ltr"` inside RTL forms.

Not in the starter: a dirty-form discard prompt, optimistic locking and field
arrays. Add them when a real form needs them, and note it here.
