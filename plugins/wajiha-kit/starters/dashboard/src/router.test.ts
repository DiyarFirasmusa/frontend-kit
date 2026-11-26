import { expect, it } from 'vitest';
import { getRouter } from './router';

it('nests feature routes under the guarded dashboard layout', () => {
  const { routesById } = getRouter();

  expect(routesById['/_app/warehouses/'].parentRoute.id).toBe('/_app');
  expect(routesById['/_app/warehouses/$warehouseId'].parentRoute.id).toBe(
    '/_app',
  );
});
