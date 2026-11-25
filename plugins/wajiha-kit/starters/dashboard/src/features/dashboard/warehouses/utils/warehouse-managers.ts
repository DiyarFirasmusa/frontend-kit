import type { WarehouseResponse } from '@/types/api/warehouses';
import type { TableFilterOption } from '@/types/table';
import { formatShortId } from '@/utils/format';

type ManagerFields = Pick<
  WarehouseResponse,
  'managerName' | 'managerUserId' | 'managerEmployeeId'
>;

/** The id that identifies a warehouse's manager, user id first. */
export function warehouseManagerKey(row: ManagerFields): string {
  return row.managerUserId ?? row.managerEmployeeId ?? '';
}

/** One option per distinct manager, labelled by name (or the short id). */
export function getWarehouseManagerOptions(
  rows: readonly ManagerFields[],
): TableFilterOption[] {
  const options = new Map<string, string>();
  for (const row of rows) {
    const key = warehouseManagerKey(row);
    if (key === '') {
      continue;
    }
    const name = row.managerName?.trim();
    if (name || !options.has(key)) {
      options.set(key, name || formatShortId(key));
    }
  }
  return [...options]
    .map(([value, label]) => ({ value, label }))
    .toSorted((a, b) => a.label.localeCompare(b.label));
}

/** Keeps the rows whose manager matches `managerKey` ('' keeps all). */
export function filterWarehousesByManager<T extends ManagerFields>(
  rows: readonly T[],
  managerKey: string,
): T[] {
  if (managerKey === '') {
    return [...rows];
  }
  return rows.filter((row) => warehouseManagerKey(row) === managerKey);
}
