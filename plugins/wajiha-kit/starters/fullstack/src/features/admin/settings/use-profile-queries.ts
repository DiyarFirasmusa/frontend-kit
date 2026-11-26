import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '../api/query-keys';
import { useAuthStore } from '../store/auth-store';
import { fetchProfile, saveProfile } from './settings.service';
import type { ProfileValues } from './validations';

export const profileQueryOptions = () =>
  queryOptions({ queryKey: qk.profile, queryFn: fetchProfile });

export function useProfile() {
  return useQuery(profileQueryOptions());
}

/** Saving puts the answer in the cache and keeps the name in the top bar in step. */
export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProfileValues) => saveProfile(values),
    onSuccess: (saved) => {
      queryClient.setQueryData(qk.profile, saved);
      const { user, setUser } = useAuthStore.getState();
      if (user !== null) {
        setUser({ ...user, name: saved.name });
      }
    },
  });
}
