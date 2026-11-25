import type { DirectoryKind } from '@/services/directory.service';
import type { ExportColumn } from '@/types/export';
import type { ExportCell } from './export-xlsx';

/** Directory ids that `person` columns hold, grouped by kind. */
export function collectPersonIds<T>(
  rows: T[],
  columns: ExportColumn<T>[],
): Map<DirectoryKind, Set<string>> {
  const ids = new Map<DirectoryKind, Set<string>>();
  for (const column of columns) {
    if (!column.person) {
      continue;
    }
    const set = ids.get(column.person) ?? new Set<string>();
    for (const row of rows) {
      if (column.personName?.(row)) {
        continue;
      }
      const value = column.value(row);
      if (typeof value === 'string' && value !== '') {
        set.add(value);
      }
    }
    if (set.size > 0) {
      ids.set(column.person, set);
    }
  }
  return ids;
}

/** The cell matrix of an export; `person` cells show the resolved name. */
export function toExportMatrix<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  names: Map<string, string> = new Map(),
): ExportCell[][] {
  return rows.map((row) =>
    columns.map((column) => {
      const value = column.value(row);
      const known = column.personName?.(row);
      if (known) {
        return known;
      }
      if (column.person && typeof value === 'string') {
        return names.get(value) ?? value;
      }
      return value;
    }),
  );
}
