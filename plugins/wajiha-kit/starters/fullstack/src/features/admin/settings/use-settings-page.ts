import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/shared/lib/vendor/zod-resolver';
import { useProfile, useSaveProfile } from './use-profile-queries';
import { EMPTY_PROFILE, profileSchema, type ProfileValues } from './validations';

/** Loads the profile into the form and saves it (the data comes from use-profile-queries). */
export function useSettingsPage() {
  const profile = useProfile();
  const save = useSaveProfile();
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
