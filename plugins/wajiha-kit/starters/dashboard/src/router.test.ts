import { expect, it } from 'vitest';
import { getRouter } from './router';

it('nests feature routes under the guarded dashboard layout', () => {
  const { routesById } = getRouter();

  expect(routesById['/_dashboard/warehouses/'].parentRoute.id).toBe(
    '/_dashboard',
  );
  expect(routesById['/_dashboard/warehouses/$warehouseId'].parentRoute.id).toBe(
    '/_dashboard',
  );
});
