import { useMemo } from 'react';
import { buildLocationTree } from '../utils/location-tree';
import { useWarehouseLocations } from './query/use-warehouse-locations';

export function useLocationsTab(warehouseId: string) {
  const query = useWarehouseLocations(warehouseId);
  const locations = query.data;

  const tree = useMemo(() => buildLocationTree(locations ?? []), [locations]);

  return {
    query,
    tree,
    total: locations?.length ?? 0,
    zoneCount: tree.length,
  };
}
