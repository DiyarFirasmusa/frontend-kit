import { describe, expect, it } from 'vitest';
import i18n from '@/lib/i18n/i18n';
import { getAttributeColumns } from './attribute-columns';

const t = i18n.t.bind(i18n);

describe('getAttributeColumns', () => {
  const columns = getAttributeColumns({ t, getActions: () => [] });

  it('sorts only on the backend sort keys', () => {
    const sortable = columns
      .filter((column) => column.enableSorting !== false)
      .map((column) => column.id);
    expect(sortable).toEqual(['name', 'code', 'dataType']);
  });

  it('ends with the actions column', () => {
    expect(columns.at(-1)?.id).toBe('actions');
  });
});
