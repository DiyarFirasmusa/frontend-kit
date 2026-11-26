import { privateApi } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Overview } from '../types/api';

export async function fetchOverview(): Promise<Overview> {
  const { data } = await privateApi.get<Overview>(endpoints.overview);
  return data;
}
