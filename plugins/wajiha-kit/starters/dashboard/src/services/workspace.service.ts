import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { WorkspaceResponse } from '@/types/api/workspace';

export async function fetchWorkspace(): Promise<WorkspaceResponse> {
  const { data } = await privateApi.get<WorkspaceResponse>(
    endpoints.workspace.detail,
  );
  return data;
}
