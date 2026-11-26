import { http, HttpResponse } from 'msw';
import type { Permission } from '../constants/permissions';
import type { Page } from '../types/api';
import { db } from './db';
import {
  api,
  denied,
  fail,
  normalize,
  ok,
  readJson,
  wait,
  type FieldMessage,
  type Message,
} from './http';

/** What a resource must say about itself. The factory below does the rest the way a backend does. */
export type CrudConfig<Row extends { id: string; updatedAt: string }, Body> = {
  /** The resource's endpoints (src/features/admin/api/endpoints.ts). */
  endpoints: {
    list: string;
    create: string;
    update: (id: string) => string;
    remove: (id: string) => string;
  };
  /** The live list in the mock database (db.ts). A getter: resetMockDb() replaces the array. */
  rows: () => Row[];
  /** The resource's permissions (constants/permissions.ts): reading, writing, deleting. */
  permissions: { read: Permission; write: Permission; delete: Permission };
  /** New ids are `<idPrefix>-<number>`. */
  idPrefix: string;
  /** The text fields ?q= searches in. */
  searchFields: (row: Row) => (string | null)[];
  /** Turns ?status=active|inactive on. Leave out when the resource has no such state. */
  isActive?: (row: Row) => boolean;
  /** A 400 message when the body is not acceptable, in both languages. */
  invalid: (body: Partial<Body>) => Message | undefined;
  /** A 409 message when the body clashes with another row (a taken code). `field` puts it under that input. */
  conflict?: (body: Partial<Body>, rows: Row[], exceptId?: string) => FieldMessage | undefined;
  /** The stored fields made from a valid body. */
  toRow: (body: Partial<Body>) => Omit<Row, 'id' | 'updatedAt'>;
  /** The 404 message. */
  notFound: Message;
};

function intParam(url: URL, name: string, fallback: number, max: number): number {
  const value = Number(url.searchParams.get(name));
  return Number.isInteger(value) && value >= 1 ? Math.min(value, max) : fallback;
}

/**
 * The mock endpoints of one resource: a paged, searchable list, create, update and delete, each checking
 * the session (401) and the permission (403) first. A page past the end answers with no rows and the real
 * total, like a real backend: the UI has to handle that itself.
 */
export function crudHandlers<Row extends { id: string; updatedAt: string }, Body>(
  config: CrudConfig<Row, Body>,
) {
  const { permissions } = config;

  return [
    http.get(api(config.endpoints.list), async ({ request }) => {
      const refused = await denied(request, permissions.read);
      if (refused !== undefined) {
        return refused;
      }
      const url = new URL(request.url);
      const query = normalize(url.searchParams.get('q') ?? '');
      const status = url.searchParams.get('status');
      const pageSize = intParam(url, 'pageSize', 10, 100);
      const { isActive } = config;
      const rows = config
        .rows()
        .filter(
          (row) =>
            query === '' ||
            config
              .searchFields(row)
              .some((value) => value !== null && normalize(value).includes(query)),
        )
        .filter((row) => {
          if (isActive === undefined || (status !== 'active' && status !== 'inactive')) {
            return true;
          }
          return status === 'active' ? isActive(row) : !isActive(row);
        })
        .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const page = intParam(url, 'page', 1, Number.MAX_SAFE_INTEGER);
      const response: Page<Row> = {
        items: rows.slice((page - 1) * pageSize, page * pageSize),
        total: rows.length,
        page,
        pageSize,
      };
      return ok(response);
    }),

    http.post(api(config.endpoints.create), async ({ request }) => {
      const refused = await denied(request, permissions.write);
      if (refused !== undefined) {
        return refused;
      }
      const body = await readJson<Body>(request);
      const invalid = config.invalid(body);
      if (invalid !== undefined) {
        return fail(request, 400, invalid);
      }
      const conflict = config.conflict?.(body, config.rows());
      if (conflict !== undefined) {
        return fail(request, 409, conflict);
      }
      db.nextId += 1;
      const row = {
        ...config.toRow(body),
        id: `${config.idPrefix}-${db.nextId}`,
        updatedAt: new Date().toISOString(),
      } as unknown as Row;
      config.rows().push(row);
      return ok(row, 201);
    }),

    http.put(api(config.endpoints.update(':id')), async ({ params, request }) => {
      const refused = await denied(request, permissions.write);
      if (refused !== undefined) {
        return refused;
      }
      const row = config.rows().find((item) => item.id === params['id']);
      if (row === undefined) {
        return fail(request, 404, config.notFound);
      }
      const body = await readJson<Body>(request);
      const invalid = config.invalid(body);
      if (invalid !== undefined) {
        return fail(request, 400, invalid);
      }
      const conflict = config.conflict?.(body, config.rows(), row.id);
      if (conflict !== undefined) {
        return fail(request, 409, conflict);
      }
      Object.assign(row, config.toRow(body), { updatedAt: new Date().toISOString() });
      return ok(row);
    }),

    http.delete(api(config.endpoints.remove(':id')), async ({ params, request }) => {
      const refused = await denied(request, permissions.delete);
      if (refused !== undefined) {
        return refused;
      }
      const rows = config.rows();
      const index = rows.findIndex((item) => item.id === params['id']);
      if (index === -1) {
        return fail(request, 404, config.notFound);
      }
      rows.splice(index, 1);
      await wait();
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
