import { publicApi } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { LoginRequest, LoginResponse } from '../types/api';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await publicApi.post<LoginResponse>(endpoints.auth.login, payload);
  return data;
}
