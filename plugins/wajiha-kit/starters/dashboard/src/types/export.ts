import type { DirectoryKind } from '@/services/directory.service';
import type { ExportCell } from '@/utils/export-xlsx';

/** One column of an Excel export: the on-screen label and the cell value. */
export interface ExportColumn<T> {
  header: string;
  value: (row: T) => ExportCell;
  /** `value` is a directory id; the export writes the person's name instead. */
  person?: DirectoryKind;
  /** The name the API already sends with a `person` id; no lookup is made for that row. */
  personName?: (row: T) => string | null | undefined;
}

/** Rows read for an export; `isTruncated` when the backend cut the result. */
export interface ExportRows<T> {
  rows: T[];
  total: number;
  isTruncated: boolean;
  /** How many rows the read was allowed to return; the warning states it. Defaults to `rows.length`. */
  limit?: number;
}
