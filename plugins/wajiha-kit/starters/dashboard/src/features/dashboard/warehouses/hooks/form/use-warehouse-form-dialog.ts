import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { WarehouseResponse } from '@/types/api/warehouses';
import {
  defaultWarehouseForm,
  toWarehousePayload,
  toWarehouseValues,
  warehouseSchema,
  type WarehouseValues,
} from '../../validations/validations';
import {
  useCreateWarehouse,
  useUpdateWarehouse,
} from '../query/use-warehouse-mutations';

export function useWarehouseFormDialog() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const create = useCreateWarehouse();
  const update = useUpdateWarehouse();

  const form = useForm<WarehouseValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: defaultWarehouseForm,
    mode: 'onChange',
  });

  const isPending = create.isPending || update.isPending;

  const close = () => {
    setOpen(false);
    setEditingId(null);
    form.reset(defaultWarehouseForm);
  };

  return {
    form,
    open,
    isEditing: editingId !== null,
    isPending,
    canSubmit: form.formState.isValid && !isPending,
    openCreate: () => {
      setEditingId(null);
      form.reset(defaultWarehouseForm);
      setOpen(true);
    },
    openEdit: (warehouse: WarehouseResponse) => {
      setEditingId(warehouse.id);
      form.reset(toWarehouseValues(warehouse));
      setOpen(true);
    },
    onOpenChange: (next: boolean) => {
      if (!next) {
        close();
      }
    },
    onSubmit: form.handleSubmit((values) => {
      const payload = toWarehousePayload(values);
      if (editingId) {
        update.mutate({ id: editingId, payload }, { onSuccess: close });
        return;
      }
      create.mutate(payload, { onSuccess: close });
    }),
  };
}

export type WarehouseFormDialogState = ReturnType<
  typeof useWarehouseFormDialog
>;
