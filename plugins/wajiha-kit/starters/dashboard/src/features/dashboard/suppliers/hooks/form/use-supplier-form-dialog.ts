import { useForm } from 'react-hook-form';
import { applyApiFieldErrors } from '@/api/error/field-errors';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import {
  defaultSupplierForm,
  SUPPLIER_FORM_FIELDS,
  supplierSchema,
  toSupplierFormValues,
  toSupplierPayload,
  type SupplierValues,
} from '../../validations/validations';
import { useSupplierDetail } from '../query/use-supplier-detail';
import {
  useCreateSupplier,
  useUpdateSupplier,
} from '../query/use-supplier-mutations';

/** Which dialog is open: one union, never three booleans. */
export type SupplierDialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; supplierId: string };

/**
 * The create/edit form. Mounted per opening (keyed by mode and id), so each
 * opening starts clean. Edit loads the record by id and fills the form when
 * it arrives; submit stays off until then.
 */
export function useSupplierFormDialog(
  mode: Exclude<SupplierDialogState, { kind: 'closed' }>,
  onDone: () => void,
) {
  const editId = mode.kind === 'edit' ? mode.supplierId : null;
  const detail = useSupplierDetail(editId);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaultSupplierForm,
    // `values` resets the form once when the record arrives.
    values: detail.data ? toSupplierFormValues(detail.data) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const flight = useSingleFlight();
  const isPending = create.isPending || update.isPending;
  const isLoading = editId !== null && detail.isPending;

  const onError = (error: unknown) => {
    // The client already toasted the summary; put field messages under the inputs.
    applyApiFieldErrors(error, form.setError, SUPPLIER_FORM_FIELDS);
  };

  const submit = form.handleSubmit((values) => {
    // Enter or a double click while a request is in flight sends nothing. The
    // ref flips at once; `isPending` only after the next render.
    if (isLoading || !flight.start()) {
      return;
    }
    const settle = { onSettled: flight.end };
    const payload = toSupplierPayload(values);
    if (editId !== null) {
      update.mutate(
        { id: editId, payload },
        { onSuccess: onDone, onError, ...settle },
      );
      return;
    }
    create.mutate(payload, { onSuccess: onDone, onError, ...settle });
  });

  return {
    form,
    isEditing: editId !== null,
    isLoading,
    isPending,
    loadFailed: detail.isError,
    submit: () => {
      void submit();
    },
  };
}
