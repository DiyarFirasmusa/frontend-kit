import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  DirectoryEntryResponse,
  DirectoryResolveRequest,
} from '@/types/api/directory';

export type DirectoryKind = 'user' | 'employee' | 'orgUnit';

export type DirectorySearchKind = 'USER' | 'EMPLOYEE' | 'ORG_UNIT';

export const DIRECTORY_SEARCH_LIMIT = 20;

export const DIRECTORY_KIND_BY_SEARCH_KIND: Record<
  DirectorySearchKind,
  DirectoryKind
> = {
  USER: 'user',
  EMPLOYEE: 'employee',
  ORG_UNIT: 'orgUnit',
};

const REQUEST_FIELD: Record<DirectoryKind, keyof DirectoryResolveRequest> = {
  user: 'userIds',
  employee: 'employeeIds',
  orgUnit: 'orgUnitIds',
};

export async function resolveDirectory(
  request: DirectoryResolveRequest,
): Promise<DirectoryEntryResponse[]> {
  const { data } = await privateApi.post<DirectoryEntryResponse[]>(
    endpoints.directory.resolve,
    request,
    { silent: true, silentError: true },
  );
  return data;
}

/**
 * `GET /api/directory/search`: finds users, employees or org units by name.
 * Errors stay silent so a failed lookup never replaces the page.
 */
export async function searchDirectory(
  kind: DirectorySearchKind,
  q: string,
  limit: number = DIRECTORY_SEARCH_LIMIT,
): Promise<DirectoryEntryResponse[]> {
  const { data } = await privateApi.get<DirectoryEntryResponse[]>(
    endpoints.directory.search,
    { params: { kind, q: q.trim() || undefined, limit }, silentError: true },
  );
  return data;
}

interface Waiter {
  resolve: (entry: DirectoryEntryResponse | null) => void;
  reject: (reason: unknown) => void;
}

let pending = new Map<string, { kind: DirectoryKind; waiters: Waiter[] }>();
let isScheduled = false;

async function flush(): Promise<void> {
  const batch = pending;
  pending = new Map();
  isScheduled = false;

  const request: DirectoryResolveRequest = {};
  for (const [id, { kind }] of batch) {
    const field = REQUEST_FIELD[kind];
    request[field] = [...(request[field] ?? []), id];
  }

  try {
    const entries = await resolveDirectory(request);
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    for (const [id, { waiters }] of batch) {
      const entry = byId.get(id) ?? null;
      waiters.forEach((waiter) => {
        waiter.resolve(entry);
      });
    }
  } catch (error: unknown) {
    for (const { waiters } of batch.values()) {
      waiters.forEach((waiter) => {
        waiter.reject(error);
      });
    }
  }
}

/**
 * Resolves one id to a directory entry. Ids asked for in the same render pass
 * are collected and sent as one `POST /api/directory/resolve`.
 */
export function loadDirectoryEntry(
  kind: DirectoryKind,
  id: string,
): Promise<DirectoryEntryResponse | null> {
  return new Promise((resolve, reject) => {
    const slot = pending.get(id) ?? { kind, waiters: [] };
    slot.waiters.push({ resolve, reject });
    pending.set(id, slot);
    if (!isScheduled) {
      isScheduled = true;
      void Promise.resolve().then(flush);
    }
  });
}
