import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type { DirectoryResolveRequest } from '@/types/api/directory';
import { loadDirectoryEntry, resolveDirectory } from './directory.service';

const USER_A = '6f1d2c3a-0000-4000-8000-000000000001';
const USER_B = '6f1d2c3a-0000-4000-8000-000000000002';
const EMPLOYEE = '3c9a1f20-0000-4000-8000-000000000010';
const ORG_UNIT = '9b8a7c6d-0000-4000-8000-000000000020';

function captureResolve(
  respond: (body: DirectoryResolveRequest) => Response,
): DirectoryResolveRequest[] {
  const bodies: DirectoryResolveRequest[] = [];
  server.use(
    http.post(api(endpoints.directory.resolve), async ({ request }) => {
      const body = (await request.json()) as DirectoryResolveRequest;
      bodies.push(body);
      return respond(body);
    }),
  );
  return bodies;
}

function entry(id: string, name: string) {
  return { id, name, avatarUrl: null };
}

describe('directory.service', () => {
  it('resolveDirectory posts the request and returns the array body', async () => {
    const bodies = captureResolve(() =>
      HttpResponse.json([entry(USER_A, 'Sara Ali')]),
    );
    await expect(resolveDirectory({ userIds: [USER_A] })).resolves.toEqual([
      entry(USER_A, 'Sara Ali'),
    ]);
    expect(bodies).toEqual([{ userIds: [USER_A] }]);
  });

  it('merges every id asked for in one tick into one POST, grouped per kind', async () => {
    const bodies = captureResolve(() =>
      HttpResponse.json([
        entry(USER_A, 'Sara Ali'),
        entry(USER_B, 'Omar Hadi'),
        entry(EMPLOYEE, 'Laila Kareem'),
        entry(ORG_UNIT, 'Logistics'),
      ]),
    );

    const results = await Promise.all([
      loadDirectoryEntry('user', USER_A),
      loadDirectoryEntry('employee', EMPLOYEE),
      loadDirectoryEntry('user', USER_B),
      loadDirectoryEntry('orgUnit', ORG_UNIT),
      loadDirectoryEntry('user', USER_A),
    ]);

    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toEqual({
      userIds: [USER_A, USER_B],
      employeeIds: [EMPLOYEE],
      orgUnitIds: [ORG_UNIT],
    });
    expect(results.map((result) => result?.name)).toEqual([
      'Sara Ali',
      'Laila Kareem',
      'Omar Hadi',
      'Logistics',
      'Sara Ali',
    ]);
  });

  it('sends a new POST for ids asked for after the batch was flushed', async () => {
    const bodies = captureResolve((body) =>
      HttpResponse.json(
        (body.userIds ?? []).map((id) => entry(id, `name-${id.slice(-1)}`)),
      ),
    );
    await loadDirectoryEntry('user', USER_A);
    await loadDirectoryEntry('user', USER_B);
    expect(bodies).toEqual([{ userIds: [USER_A] }, { userIds: [USER_B] }]);
  });

  it('resolves null for an id the directory does not know', async () => {
    captureResolve(() => HttpResponse.json([entry(USER_A, 'Sara Ali')]));
    const [known, missing] = await Promise.all([
      loadDirectoryEntry('user', USER_A),
      loadDirectoryEntry('user', USER_B),
    ]);
    expect(known?.name).toBe('Sara Ali');
    expect(missing).toBeNull();
  });

  it('rejects every waiter of the batch when the request fails', async () => {
    captureResolve(() =>
      HttpResponse.json({ message: 'boom' }, { status: 500 }),
    );
    const results = await Promise.allSettled([
      loadDirectoryEntry('user', USER_A),
      loadDirectoryEntry('employee', EMPLOYEE),
      loadDirectoryEntry('user', USER_A),
    ]);
    expect(results.map((result) => result.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
    ]);
  });
});
