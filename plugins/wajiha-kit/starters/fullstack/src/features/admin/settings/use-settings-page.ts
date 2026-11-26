import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/shared/lib/vendor/zod-resolver';
import { privateApi } from '../api/client';
import { endpoints } from '../api/endpoints';
import { qk } from '../api/query-keys';
import { useAuthStore } from '../store/auth-store';
import type { Profile } from '../types/api';
import { EMPTY_PROFILE, profileSchema, type ProfileValues } from './validations';

async function fetchProfile(): Promise<Profile> {
  const { data } = await privateApi.get<Profile>(endpoints.profile);
  return data;
}

async function saveProfile(values: ProfileValues): Promise<Profile> {
  const { data } = await privateApi.put<Profile>(endpoints.profile, values, {
    successMessage: 'settings.saved',
  });
  return data;
}

/** Loads the profile into the form, saves it, and keeps the name in the top bar in step. */
export function useSettingsPage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: qk.profile, queryFn: fetchProfile });
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY_PROFILE,
  });
  const { reset } = form;

  useEffect(() => {
    if (profile.data !== undefined) {
      reset(profile.data);
    }
  }, [profile.data, reset]);

  const save = useMutation({
    mutationFn: saveProfile,
    onSuccess: (saved) => {
      queryClient.setQueryData(qk.profile, saved);
      const user = useAuthStore.getState().user;
      if (user !== null) {
        useAuthStore.getState().setUser({ ...user, name: saved.name });
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!save.isPending) {
      save.mutate(values);
    }
  });

  return {
    form,
    onSubmit,
    isLoading: profile.isLoading,
    isError: profile.isError,
    retry: () => {
      void profile.refetch();
    },
    isSaving: save.isPending,
  };
}
