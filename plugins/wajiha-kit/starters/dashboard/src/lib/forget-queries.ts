import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * After a delete, the record's own queries must never refetch: each would 404
 * and toast "Record not found". In-flight ones are aborted (the services take
 * the query signal) and unused ones are dropped. A query that a mounted
 * component still watches is left in place on purpose: removing a watched
 * query makes its observer create it again and fetch it. That component moves
 * on (the selection falls back, the page leaves) and the query is collected
 * later.
 */
export async function forgetQueries(
  qc: QueryClient,
  queryKeys: readonly QueryKey[],
): Promise<void> {
  await Promise.all(
    queryKeys.map((queryKey) => qc.cancelQueries({ queryKey })),
  );
  for (const queryKey of queryKeys) {
    qc.removeQueries({ queryKey, type: 'inactive' });
  }
}
