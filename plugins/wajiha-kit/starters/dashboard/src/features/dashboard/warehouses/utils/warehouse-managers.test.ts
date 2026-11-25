import { describe, expect, it } from 'vitest';
import { makeWarehouse } from '../warehouse-test-utils';
import {
  filterWarehousesByManager,
  getWarehouseManagerOptions,
  warehouseManagerKey,
} from './warehouse-managers';

const sara = makeWarehouse({
  id: 'a',
  managerUserId: 'user-sara',
  managerName: 'Sara Ali',
});
const omar = makeWarehouse({
  id: 'b',
  managerUserId: null,
  managerEmployeeId: 'emp-omar-0001',
  managerName: null,
});
const none = makeWarehouse({
  id: 'c',
  managerUserId: null,
  managerEmployeeId: null,
});

describe('warehouseManagerKey', () => {
  it('prefers the user id, then the employee id', () => {
    expect(warehouseManagerKey(sara)).toBe('user-sara');
    expect(warehouseManagerKey(omar)).toBe('emp-omar-0001');
    expect(warehouseManagerKey(none)).toBe('');
  });
});

describe('getWarehouseManagerOptions', () => {
  it('lists each manager once, by name or short id', () => {
    const options = getWarehouseManagerOptions([sara, sara, omar, none]);
    expect(options.map((o) => o.value)).toEqual(
      expect.arrayContaining(['user-sara', 'emp-omar-0001']),
    );
    expect(options).toHaveLength(2);
    expect(options.find((o) => o.value === 'user-sara')?.label).toBe(
      'Sara Ali',
    );
  });
});

describe('filterWarehousesByManager', () => {
  it('keeps every row for an empty key', () => {
    expect(filterWarehousesByManager([sara, omar, none], '')).toHaveLength(3);
  });

  it('keeps only the rows of the selected manager', () => {
    expect(
      filterWarehousesByManager([sara, omar, none], 'user-sara').map(
        (r) => r.id,
      ),
    ).toEqual(['a']);
  });
});
