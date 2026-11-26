import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  updateUnitOfMeasure,
} from '../../services/units-of-measure.service';
import type { UnitOfMeasurePayload } from '../../types/types';

// Returning the promise keeps `isPending` true until the list has refetched,
// so the dialog closes on fresh data and a second click cannot slip in.
export function useCreateUnitOfMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnitOfMeasurePayload) => createUnitOfMeasure(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.unitsOfMeasure.all }),
  });
}

export function useUpdateUnitOfMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: UnitOfMeasurePayload }) =>
      updateUnitOfMeasure(vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.unitsOfMeasure.all }),
  });
}

export function useDeleteUnitOfMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUnitOfMeasure(id),
    onSuccess: (_data, id) => {
      // Drop the deleted record first: invalidating it would refetch a 404.
      qc.removeQueries({ queryKey: qk.unitsOfMeasure.detail(id) });
      return qc.invalidateQueries({ queryKey: qk.unitsOfMeasure.lists() });
    },
  });
}
