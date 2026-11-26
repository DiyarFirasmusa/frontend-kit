import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  createAttributeDefinition,
  deleteAttributeDefinition,
  saveAttributeOptions,
  updateAttributeDefinition,
} from '../../services/attributes.service';
import type { AttributePayload } from '../../types/types';
import type { OptionChanges } from '../../utils/option-order';

/** Attributes show up inside category assignments too, so both families refresh. */
function invalidateAttributeData(qc: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: qk.attributes.all }),
    qc.invalidateQueries({ queryKey: qk.categories.all }),
  ]);
}

export function useCreateAttributeDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttributePayload) =>
      createAttributeDefinition(payload),
    onSuccess: () => invalidateAttributeData(qc),
  });
}

export function useUpdateAttributeDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: AttributePayload }) =>
      updateAttributeDefinition(vars.id, vars.payload),
    onSuccess: () => invalidateAttributeData(qc),
  });
}

export function useDeleteAttributeDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttributeDefinition(id),
    onSuccess: (_data, id) => {
      // Drop the deleted record first: invalidating it would refetch a 404.
      qc.removeQueries({ queryKey: qk.attributes.detail(id) });
      return Promise.all([
        qc.invalidateQueries({ queryKey: qk.attributes.lists() }),
        qc.invalidateQueries({ queryKey: qk.categories.all }),
      ]);
    },
  });
}

export function useSaveAttributeOptions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { definitionId: string; changes: OptionChanges }) =>
      saveAttributeOptions(vars.definitionId, vars.changes),
    // Refresh on failure too: earlier requests of the batch may have been saved.
    onSettled: () => invalidateAttributeData(qc),
  });
}
