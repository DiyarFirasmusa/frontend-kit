import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '../api/query-keys';
import { fetchOverview } from './overview.service';

export const overviewQueryOptions = () =>
  queryOptions({ queryKey: qk.overview, queryFn: fetchOverview });

export function useOverview() {
  return useQuery(overviewQueryOptions());
}
