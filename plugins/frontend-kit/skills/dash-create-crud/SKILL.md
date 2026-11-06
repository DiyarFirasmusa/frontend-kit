---
name: dash-create-crud
description: "Dashboard profile: add create, edit and delete for an entity — a create/edit form dialog or page with react-hook-form + zod, mutation hooks that invalidate (or optimistic toggles), backend field errors mapped onto inputs, single-flight submit, and a confirm-before-delete dialog, all permission-gated. Use when the user asks for add / new / create / edit / update / delete / remove / archive / toggle active, a form dialog, a CRUD screen, or bulk delete."
---

# Dashboard: create / edit / delete

Rules this follows: `.claude/rules/forms-crud.md`, `.claude/rules/api-layer.md`,
`.claude/rules/permissions.md`. Field-level form mechanics: the shared
`create-form` skill. Full code: `references/crud-examples.md`.

## 0. Gather

- Create / update / delete endpoints, request bodies and the error body for
  validation failures (field → messages), from `docs/api/openapi.json`.
- Dialog or page (table in `forms-crud.md`). Default: dialog.
- Permission per action (`PERMS.<entity>.create | update | delete`).
- Which fields are editable after create; which are read-only in edit.
- Any toggle (active, archived) that should be optimistic.

## 1. Files

Under `src/features/<group>/<entity>/` (dialog flow; for pages the same files
live in `pages/create/` and `pages/edit/`, shared ones in `pages/`):

| File                                         | Holds                                                    |
| -------------------------------------------- | -------------------------------------------------------- |
| `validations/validations.ts`                 | `xFormSchema`, `XFormValues`, `defaultXForm`, `toXPayload`, `toXFormValues` |
| `services/<entity>.service.ts`               | `createX`, `updateX`, `deleteX` (+ `bulkDeleteX`)        |
| `hooks/query/use-<entity>-mutations.ts`      | `useCreateX`, `useUpdateX`, `useDeleteX`, toggles        |
| `hooks/query/use-<entity>-detail.ts`         | `xDetailQueryOptions(id)`, `useXDetail(id)`              |
| `hooks/form/use-<entity>-form-dialog.ts`     | form + submit + field-error mapping                      |
| `components/dialog/<entity>-form-dialog.tsx` | the dialog markup                                        |
| list page hook                               | dialog state union, pending delete, confirm handler      |

## 2. Order

1. Schema + mappers, with unit tests for both mappers and every message.
2. Services, then mutation hooks: `onSuccess` returns
   `qc.invalidateQueries({ queryKey: qk.x.all })` so `isPending` lasts until
   the list has refetched.
3. Form hook: `useForm` with `zodResolver`, `values` from the detail query in
   edit mode, single-flight `onSubmit` using `mutate(..., { onSuccess, onError })`.
4. Dialog component: `FormDialog` from `@/components/dialog/form-dialog`,
   rendered with `key` = mode + id so each opening starts clean.
5. Delete: `ConfirmDialog` from the list page, opened with the row,
   single-flight confirm, back one page if it removed the last row.
6. Wire into the list page hook and container; gate every button with
   `useCan()` / `can(PERMS…)`.
7. Locales in both languages: titles, labels, placeholders, validation
   messages, confirm texts with the record name, discard prompt.

## 3. Invariants

- Dialog state is one union: `{ kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; id }`.
- The submit button is `disabled` while pending and shows progress; the
  handler also returns early when a mutation is pending.
- The client toasts success and errors; the form only maps field errors
  (`applyApiFieldErrors`) and keeps the user's input on error.
- Edit never trusts the table row: it loads the detail by id.
- Optimistic updates only for single-row toggles, with snapshot + rollback +
  `onSettled` invalidate. Create and delete always invalidate.
- Delete confirm names the record, starts focus on Cancel, stays open until
  the request settles.

## 4. Tests

- `validations/validations.test.ts`: schema accepts a valid form, rejects each
  invalid field with the right key; `toXPayload` / `toXFormValues` round-trip.
- `hooks/query/use-<entity>-mutations.test.ts` (MSW): success invalidates
  `qk.x.all`; the optimistic toggle rolls back on a 500.
- `components/dialog/<entity>-form-dialog.test.tsx`: required errors inline;
  double submit sends one request; a 422 puts the message under the field;
  edit mode shows the loaded values.
- List integration: delete → confirm → one DELETE → row gone; cancel sends nothing;
  without the delete permission the action is not rendered.
- e2e: create → appears in list; edit → updated; delete → removed. Arabic and English.

## 5. Check by eye

RTL and LTR, phone and desktop: footer button order, `dir="ltr"` on email /
phone / code inputs, focus returns to the opener after close, no layout jump
when the edit data arrives. Then `verify`.

## Don't

- No toasts or `try/catch` around mutations in components.
- No `mutateAsync` inside `handleSubmit` without handling the rejection.
- No client-side loop of single deletes for a bulk action.
