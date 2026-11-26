import { privateApi } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Profile } from '../types/api';
import type { ProfileValues } from './validations';

export async function fetchProfile(): Promise<Profile> {
  const { data } = await privateApi.get<Profile>(endpoints.profile);
  return data;
}

export async function saveProfile(values: ProfileValues): Promise<Profile> {
  const { data } = await privateApi.put<Profile>(endpoints.profile, values, {
    successMessage: 'settings.saved',
  });
  return data;
}
