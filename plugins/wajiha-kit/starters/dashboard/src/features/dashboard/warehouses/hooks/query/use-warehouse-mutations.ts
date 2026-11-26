import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  createWarehouse,
  deleteWarehouse,
  updateWarehouse,
} from '../../services/warehouses.service';
import type { WarehousePayload } from '../../types/types';

// Returning the promise keeps `isPending` true until the list has refetched,
// so the dialog closes on fresh data and a second click cannot slip in.
export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehousePayload) => createWarehouse(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.warehouses.all }),
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: WarehousePayload }) =>
      updateWarehouse(vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.warehouses.all }),
  });
}

/** The queries that belong to one warehouse record. */
export function warehouseRecordKeys(id: string) {
  return [
    qk.warehouses.detail(id),
    qk.warehouses.locations(id),
    qk.warehouses.users(id),
  ];
}

/**
 * After a delete, the record's own queries must never refetch: each would
 * 404 and toast "Record not found". In-flight ones are aborted (the services
 * take the query signal); unused ones are dropped. Queries a still-open
 * detail page is watching stay in place, untouched, because removing a
 * watched query makes its next render fetch it again; the detail page drops
 * them once it has left (useWarehouseDetailPage).
 */
function forgetDeletedWarehouse(qc: QueryClient, id: string) {
  for (const queryKey of warehouseRecordKeys(id)) {
    void qc.cancelQueries({ queryKey });
    qc.removeQueries({ queryKey, type: 'inactive' });
  }
  return qc.invalidateQueries({
    queryKey: qk.warehouses.all,
    predicate: (query) => !query.queryKey.includes(id),
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: (_data, id) => forgetDeletedWarehouse(qc, id),
  });
}
