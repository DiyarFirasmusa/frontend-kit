import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { WorkspaceResponse } from '@/types/api/workspace';

/** `signal` comes from TanStack Query, so a cancelled query aborts the request. */
interface RequestOptions {
  signal?: AbortSignal;
}

export async function fetchWorkspace(
  options?: RequestOptions,
): Promise<WorkspaceResponse> {
  const { data } = await privateApi.get<WorkspaceResponse>(
    endpoints.workspace.detail,
    { signal: options?.signal },
  );
  return data;
}
