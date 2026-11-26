import { useForm } from 'react-hook-form';
import { applyApiFieldErrors } from '@/api/error/field-errors';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import { useAttributeDefinitionDetail } from '../../../../hooks/query/use-attribute-definitions';
import {
  useCreateAttributeDefinition,
  useUpdateAttributeDefinition,
} from '../../../../hooks/query/use-attribute-mutations';
import {
  ATTRIBUTE_FORM_FIELDS,
  attributeDefinitionSchema,
  defaultAttributeDefinitionForm,
  toAttributeDefinitionPayload,
  toAttributeFormValues,
  type AttributeDefinitionFormValues,
} from '../../../../validations/validations';

/** Which dialog is open on the attributes page: one union, never booleans. */
export type AttributeDialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; attributeId: string }
  | { kind: 'options'; attributeId: string };

/**
 * The create/edit form. Mounted per opening (keyed by mode and id), so each
 * opening starts clean. Edit loads the record by id and fills the form when
 * it arrives; submit stays off until then.
 */
export function useAttributeFormDialog(
  mode: Extract<AttributeDialogState, { kind: 'create' | 'edit' }>,
  onDone: () => void,
) {
  const editId = mode.kind === 'edit' ? mode.attributeId : null;
  const detail = useAttributeDefinitionDetail(editId);
  const create = useCreateAttributeDefinition();
  const update = useUpdateAttributeDefinition();
  const form = useForm<AttributeDefinitionFormValues>({
    resolver: zodResolver(attributeDefinitionSchema),
    defaultValues: defaultAttributeDefinitionForm,
    // `values` resets the form once when the record arrives.
    values: detail.data ? toAttributeFormValues(detail.data) : undefined,
    resetOptions: { keepDirtyValues: true },
  });
  const flight = useSingleFlight();
  const isPending = create.isPending || update.isPending;
  const isLoading = editId !== null && detail.isPending;

  const onError = (error: unknown) => {
    // The client already toasted the summary; put field messages under the inputs.
    applyApiFieldErrors(error, form.setError, ATTRIBUTE_FORM_FIELDS);
  };

  const submit = form.handleSubmit((values) => {
    // Enter or a double click while a request is in flight sends nothing. The
    // ref flips at once; `isPending` only after the next render.
    if (isLoading || !flight.start()) {
      return;
    }
    const settle = { onSettled: flight.end };
    const payload = toAttributeDefinitionPayload(values);
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
