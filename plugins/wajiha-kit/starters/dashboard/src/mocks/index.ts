import { attributeHandlers } from './handlers/attributes';
import { authHandlers } from './handlers/auth';
import { categoryHandlers } from './handlers/categories';
import { overviewHandlers } from './handlers/overview';
import { searchHandlers } from './handlers/search';
import { shellHandlers } from './handlers/shell';
import { supplierHandlers } from './handlers/suppliers';
import { unitHandlers } from './handlers/units';
import { warehouseHandlers } from './handlers/warehouses';

/**
 * Every mock endpoint, one list per feature. Add a feature's handlers here:
 * the browser demo (browser.ts), unit tests (`server.use(...xHandlers)`) and
 * Playwright (`mockApi.backend()`) all read this one set.
 */
export const mockHandlers = [
  ...authHandlers,
  ...shellHandlers,
  ...overviewHandlers,
  ...searchHandlers,
  ...warehouseHandlers,
  ...supplierHandlers,
  ...unitHandlers,
  ...categoryHandlers,
  ...attributeHandlers,
];
