import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWorkspace } from '@/services/workspace.service';

export function useWorkspace() {
  return useQuery({
    queryKey: qk.workspace,
    queryFn: ({ signal }) => fetchWorkspace({ signal }),
  });
}
