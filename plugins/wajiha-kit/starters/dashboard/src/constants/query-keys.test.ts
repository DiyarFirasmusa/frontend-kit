import { expect, it } from 'vitest';
import { qk } from './query-keys';

it('every warehouses key starts with the feature root so invalidation reaches it', () => {
  for (const key of [
    qk.warehouses.list({ page: 0 }),
    qk.warehouses.detail('w1'),
  ]) {
    expect(key.slice(0, qk.warehouses.all.length)).toEqual(qk.warehouses.all);
  }
});
