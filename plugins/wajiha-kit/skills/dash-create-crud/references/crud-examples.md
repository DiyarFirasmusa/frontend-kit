# CRUD examples (example entity: users)

Paths relative to `src/features/app/users/`. Field names, payloads and the
validation error body must mirror the project's OpenAPI.

## validations/validations.ts

```ts
import { z } from 'zod';
import { USER_STATUSES, type UserDetail, type UserPayload } from '../types/types';

export const userFormSchema = z.object({
  name: z.string().trim().min(2, { message: 'users.nameTooShort' }),
  email: z.email({ message: 'users.emailInvalid' }),
  roleId: z.string().min(1, { message: 'common.required' }),
  status: z.enum(USER_STATUSES),
});
export type UserFormValues = z.infer<typeof userFormSchema>;

export const defaultUserForm: UserFormValues = { name: '', email: '', roleId: '', status: 'active' };

export function toUserFormValues(detail: UserDetail): UserFormValues {
  return { name: detail.name, email: detail.email, roleId: detail.role.id, status: detail.status };
}

export function toUserPayload(values: UserFormValues): UserPayload {
  return { name: values.name, email: values.email.toLowerCase(), roleId: values.roleId, status: values.status };
}
```

## hooks/query/use-users-mutations.ts

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { createUser, deleteUser, setUserActive, updateUser } from '../../services/users.service';
import type { UserListResponse, UserPayload } from '../../types/types';

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    // Returned so isPending lasts until the list has the new row.
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users.all }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UserPayload }) => updateUser(vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users.all }),
  });
}

/** Optimistic: a single-row flag whose server result is predictable. */
export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; active: boolean }) => setUserActive(vars.id, vars.active),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: qk.users.lists() });
      const snapshots = qc.getQueriesData<UserListResponse>({ queryKey: qk.users.lists() });
      qc.setQueriesData<UserListResponse>({ queryKey: qk.users.lists() }, (old) =>
        old
          ? {
              ...old,
              content: old.content.map((user) =>
                user.id === vars.id ? { ...user, status: vars.active ? 'active' : 'disabled' } : user,
              ),
            }
          : old,
      );
      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        qc.setQueryData(key, data);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.users.all }),
  });
}
```

## Backend field errors → inputs (`src/api/error/field-errors.ts`, shared)

```ts
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getErrorData } from './api-error';

/**
 * Puts the backend's per-field messages under the matching inputs. Adapt the
 * body shape to the backend (`errors: { field: string[] }` here).
 */
export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): void {
  const data = getErrorData(error);
  if (typeof data !== 'object' || data === null || !('errors' in data)) {
    return;
  }
  const { errors } = data;
  if (typeof errors !== 'object' || errors === null) {
    return;
  }
  for (const field of fields) {
    const messages: unknown = Reflect.get(errors, field);
    const first: unknown = Array.isArray(messages) ? messages.at(0) : undefined;
    if (typeof first === 'string') {
      setError(field, { type: 'server', message: first });
    }
  }
}
```

## hooks/form/use-user-form-dialog.ts

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { applyApiFieldErrors } from '@/api/error/field-errors';
import { useUserDetail } from '../query/use-user-detail';
import { useCreateUser, useUpdateUser } from '../query/use-users-mutations';
import {
  defaultUserForm,
  toUserFormValues,
  toUserPayload,
  userFormSchema,
  type UserFormValues,
} from '../../validations/validations';

export type UserDialogState = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; userId: string };

const FORM_FIELDS = ['name', 'email', 'roleId', 'status'] as const;

export function useUserFormDialog(mode: Exclude<UserDialogState, { kind: 'closed' }>, onDone: () => void) {
  const editId = mode.kind === 'edit' ? mode.userId : '';
  const detail = useUserDetail(editId); // enabled: Boolean(editId)
  const create = useCreateUser();
  const update = useUpdateUser();
  const loadedValues = useMemo(() => (detail.data ? toUserFormValues(detail.data) : undefined), [detail.data]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultUserForm,
    values: loadedValues,
  });

  const isSaving = create.isPending || update.isPending;
  const isLoadingRecord = mode.kind === 'edit' && detail.isPending;

  const onSubmit = form.handleSubmit((values) => {
    // Single-flight: Enter or a second click while saving does nothing.
    if (isSaving) {
      return;
    }
    const callbacks = {
      onSuccess: onDone,
      onError: (error: unknown) => {
        applyApiFieldErrors(error, form.setError, FORM_FIELDS);
      },
    };
    const payload = toUserPayload(values);
    if (mode.kind === 'edit') {
      update.mutate({ id: mode.userId, payload }, callbacks);
    } else {
      create.mutate(payload, callbacks);
    }
  });

  return { form, onSubmit, isSaving, isLoadingRecord, isEdit: mode.kind === 'edit' };
}
```

## components/dialog/user-form-dialog.tsx

```tsx
import { useTranslation } from 'react-i18next';
import { FormDialog } from '@/components/dialog/form-dialog';
import { SelectField } from '@/components/fields/select-field';
import { TextField } from '@/components/fields/text-field';
import { useUserFormDialog, type UserDialogState } from '../../hooks/form/use-user-form-dialog';

interface UserFormDialogProps {
  mode: Exclude<UserDialogState, { kind: 'closed' }>;
  onClose: () => void;
}

export function UserFormDialog({ mode, onClose }: UserFormDialogProps) {
  const { t } = useTranslation();
  const dialog = useUserFormDialog(mode, onClose);
  return (
    <FormDialog
      open
      title={dialog.isEdit ? t('users.editTitle') : t('users.createTitle')}
      submitLabel={dialog.isEdit ? t('common.save') : t('common.create')}
      isSubmitting={dialog.isSaving}
      isLoading={dialog.isLoadingRecord}
      isDirty={dialog.form.formState.isDirty}
      onSubmit={dialog.onSubmit}
      onClose={onClose}
    >
      <TextField control={dialog.form.control} name="name" label={t('users.name')} required />
      <TextField control={dialog.form.control} name="email" label={t('users.email')} type="email" dir="ltr" required />
      <SelectField control={dialog.form.control} name="roleId" label={t('users.role')} options={[]} required />
    </FormDialog>
  );
}
```

`FormDialog` owns: `<form noValidate>`, the skeleton while `isLoading`, the
submit button disabled + spinner while `isSubmitting`, the discard prompt when
`isDirty`, focus return to the opener. In the list container:

```tsx
{page.dialog.kind === 'closed' ? null : (
  <UserFormDialog
    key={page.dialog.kind === 'edit' ? page.dialog.userId : 'create'}
    mode={page.dialog}
    onClose={page.closeDialog}
  />
)}
```

## Delete in the list page hook

```ts
const remove = useDeleteUser();

const confirmDelete = () => {
  if (!pendingDelete || remove.isPending) {
    return;
  }
  const removesLastRowOnPage = rows.length === 1 && search.page > 1;
  remove.mutate(pendingDelete.id, {
    onSuccess: () => {
      setPendingDelete(null);
      if (removesLastRowOnPage) {
        void navigate({ search: (prev) => ({ ...prev, page: prev.page - 1 }) });
      }
    },
  });
};
```

```tsx
<ConfirmDialog
  open={page.pendingDelete !== null}
  tone="danger"
  title={page.t('users.deleteTitle')}
  description={page.t('users.deleteConfirm', { name: page.pendingDelete?.name ?? '' })}
  confirmLabel={page.t('common.delete')}
  isPending={page.isDeleting}
  onConfirm={page.confirmDelete}
  onCancel={page.closeDelete}
/>
```

## Bulk delete

Same shape with `rowSelection` from the list page hook (cleared on page,
filter and sort change), `useBulkDeleteUsers()` posting the ids in one request,
a confirm that states the count, and `setRowSelection({})` on success.
