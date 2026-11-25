import { http, HttpResponse } from 'msw';
import { endpoints } from '@/constants/api';
import type { DirectoryResolveRequest } from '@/types/api/directory';
import { api } from './handlers';
import { server } from './server';

/**
 * Serves `POST /api/directory/resolve` from an `id → name` map and records
 * every request body, so tests can assert names and the number of requests.
 */
export function serveDirectoryNames(
  names: Record<string, string>,
): DirectoryResolveRequest[] {
  const bodies: DirectoryResolveRequest[] = [];
  server.use(
    http.post(api(endpoints.directory.resolve), async ({ request }) => {
      const body = (await request.json()) as DirectoryResolveRequest;
      bodies.push(body);
      const ids = [
        ...(body.userIds ?? []),
        ...(body.employeeIds ?? []),
        ...(body.orgUnitIds ?? []),
      ];
      return HttpResponse.json(
        ids
          .filter((id) => id in names)
          .map((id) => ({ id, name: names[id] ?? null, avatarUrl: null })),
      );
    }),
  );
  return bodies;
}

export interface DirectorySearchRequest {
  kind: string | null;
  q: string | null;
  limit: string | null;
}

export interface DirectoryPerson {
  id: string;
  name: string;
  subtitle?: string | null;
}

/**
 * Serves `GET /api/directory/search` from a list of people, filtering by a
 * case-insensitive name match on `q`, and records every request.
 */
export function serveDirectorySearch(
  people: DirectoryPerson[],
): DirectorySearchRequest[] {
  const requests: DirectorySearchRequest[] = [];
  server.use(
    http.get(api(endpoints.directory.search), ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get('q');
      requests.push({
        kind: url.searchParams.get('kind'),
        q,
        limit: url.searchParams.get('limit'),
      });
      const needle = (q ?? '').toLowerCase();
      return HttpResponse.json(
        people
          .filter((person) => person.name.toLowerCase().includes(needle))
          .map((person) => ({
            avatarUrl: null,
            employmentStatus: null,
            subtitle: null,
            ...person,
          })),
      );
    }),
  );
  return requests;
}
