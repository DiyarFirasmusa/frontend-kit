import type { DirectoryResolveRequest } from '@/types/api/directory';
import type { DirectoryKind } from './directory.service';
import { resolveDirectory } from './directory.service';

const CHUNK = 500;

const REQUEST_FIELD: Record<DirectoryKind, keyof DirectoryResolveRequest> = {
  user: 'userIds',
  employee: 'employeeIds',
  orgUnit: 'orgUnitIds',
};

/**
 * Names for the directory ids in an export, id → name. Looked up in chunks;
 * a failed lookup leaves the ids out, so the export writes the id instead.
 */
export async function resolveExportNames(
  ids: Map<DirectoryKind, Set<string>>,
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const requests: DirectoryResolveRequest[] = [];
  for (const [kind, set] of ids) {
    const list = [...set];
    for (let index = 0; index < list.length; index += CHUNK) {
      requests.push({
        [REQUEST_FIELD[kind]]: list.slice(index, index + CHUNK),
      });
    }
  }
  const results = await Promise.allSettled(
    requests.map((request) => resolveDirectory(request)),
  );
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const entry of result.value) {
        if (entry.name) {
          names.set(entry.id, entry.name);
        }
      }
    }
  }
  return names;
}
