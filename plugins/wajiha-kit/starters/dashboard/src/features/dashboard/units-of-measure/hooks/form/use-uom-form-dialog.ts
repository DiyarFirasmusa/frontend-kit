import { useForm } from 'react-hook-form';
import { applyApiFieldErrors } from '@/api/error/field-errors';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import {
  defaultUnitOfMeasureForm,
  toUnitOfMeasurePayload,
  toUnitOfMeasureValues,
  UOM_FORM_FIELDS,
  unitOfMeasureSchema,
  type UnitOfMeasureValues,
} from '../../validations/validations';
import { useUnitOfMeasureDetail } from '../query/use-uom-detail';
import {
  useCreateUnitOfMeasure,
  useUpdateUnitOfMeasure,
} from '../query/use-uom-mutations';

/** Which dialog is open: one union, never three booleans. */
export type UnitOfMeasureDialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; unitId: string };

/**
 * The create/edit form. Mounted per opening (keyed by mode and id), so each
 * opening starts clean. Edit loads the record by id and fills the form when
 * it arrives; submit stays off until then.
 */
export function useUnitOfMeasureFormDialog(
  mode: Exclude<UnitOfMeasureDialogState, { kind: 'closed' }>,
  onDone: () => void,
) {
  const editId = mode.kind === 'edit' ? mode.unitId : null;
  const detail = useUnitOfMeasureDetail(editId);
  const create = useCreateUnitOfMeasure();
  const update = useUpdateUnitOfMeasure();
  const form = useForm<UnitOfMeasureValues>({
    resolver: zodResolver(unitOfMeasureSchema),
    defaultValues: defaultUnitOfMeasureForm,
    // `values` resets the form once when the record arrives.
    values: detail.data ? toUnitOfMeasureValues(detail.data) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const isPending = create.isPending || update.isPending;
  const isLoading = editId !== null && detail.isPending;

  const onError = (error: unknown) => {
    // The client already toasted the summary; put field messages under the inputs.
    applyApiFieldErrors(error, form.setError, UOM_FORM_FIELDS);
  };

  const submit = form.handleSubmit((values) => {
    // Enter or a double click while a request is in flight sends nothing.
    if (isPending || isLoading) {
      return;
    }
    const payload = toUnitOfMeasurePayload(values);
    if (editId !== null) {
      update.mutate({ id: editId, payload }, { onSuccess: onDone, onError });
      return;
    }
    create.mutate(payload, { onSuccess: onDone, onError });
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
