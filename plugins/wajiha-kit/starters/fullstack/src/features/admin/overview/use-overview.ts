import { useQuery } from '@tanstack/react-query';
import { qk } from '../api/query-keys';
import { fetchOverview } from './overview.service';

export function useOverview() {
  return useQuery({ queryKey: qk.overview, queryFn: fetchOverview });
}
