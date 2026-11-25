import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { UnitOfMeasureRow } from '../../types/types';
import {
  defaultUnitOfMeasureForm,
  toUnitOfMeasurePayload,
  toUnitOfMeasureValues,
  unitOfMeasureSchema,
  type UnitOfMeasureValues,
} from '../../validations/validations';
import {
  useCreateUnitOfMeasure,
  useUpdateUnitOfMeasure,
} from '../query/use-uom-mutations';

export function useUnitOfMeasureFormDialog() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const create = useCreateUnitOfMeasure();
  const update = useUpdateUnitOfMeasure();

  const form = useForm<UnitOfMeasureValues>({
    resolver: zodResolver(unitOfMeasureSchema),
    defaultValues: defaultUnitOfMeasureForm,
    mode: 'onChange',
  });

  const isPending = create.isPending || update.isPending;

  const close = useCallback(() => {
    setOpen(false);
    setEditingId(null);
    form.reset(defaultUnitOfMeasureForm);
  }, [form]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    form.reset(defaultUnitOfMeasureForm);
    setOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (row: UnitOfMeasureRow) => {
      setEditingId(row.id);
      form.reset(toUnitOfMeasureValues(row));
      setOpen(true);
    },
    [form],
  );

  return {
    form,
    open,
    isEditing: editingId !== null,
    isPending,
    canSubmit: !isPending,
    openCreate,
    openEdit,
    onOpenChange: (next: boolean) => {
      if (!next) {
        close();
      }
    },
    onSubmit: form.handleSubmit((values) => {
      const payload = toUnitOfMeasurePayload(values);
      if (editingId) {
        update.mutate({ id: editingId, payload }, { onSuccess: close });
        return;
      }
      create.mutate(payload, { onSuccess: close });
    }),
  };
}

export type UnitOfMeasureFormDialogState = ReturnType<
  typeof useUnitOfMeasureFormDialog
>;
