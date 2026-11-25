import { useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { SupplierRow } from '../../types/types';
import {
  defaultSupplierForm,
  supplierSchema,
  type SupplierValues,
} from '../../validations/validations';
import {
  useCreateSupplier,
  useUpdateSupplier,
} from '../query/use-supplier-mutations';
import {
  toRegisterFormValues,
  toSupplierFormValues,
  toSupplierPayload,
} from '../supplier-actions';

interface UseSupplierFormDialogParams {
  open: boolean;
  /** The master row being edited; null for a new supplier. */
  editing: SupplierRow | null;
  /** A document-only name being registered: fills the create form. */
  registering: SupplierRow | null;
  onDone: () => void;
}

export function useSupplierFormDialog({
  open,
  editing,
  registering,
  onDone,
}: UseSupplierFormDialogParams): {
  form: UseFormReturn<SupplierValues>;
  isPending: boolean;
  submit: () => void;
} {
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaultSupplierForm,
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editing) {
      reset(toSupplierFormValues(editing));
      return;
    }
    reset(
      registering ? toRegisterFormValues(registering) : defaultSupplierForm,
    );
  }, [open, editing, registering, reset]);

  const submit = form.handleSubmit((values) => {
    const payload = toSupplierPayload(values);
    if (editing) {
      update.mutate({ id: editing.id, payload }, { onSuccess: onDone });
      return;
    }
    create.mutate(payload, { onSuccess: onDone });
  });

  return {
    form,
    isPending: create.isPending || update.isPending,
    submit: () => {
      void submit();
    },
  };
}
