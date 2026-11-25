import { useMe } from '@/hooks/use-me';
import { useAuthStore } from '@/store/auth-store';
import { getInitials } from '@/utils/initials';

export interface CurrentUser {
  displayName: string;
  firstName: string | null;
  jobTitle: string | null;
  orgUnitName: string | null;
  avatarUrl: string | null;
  initials: string;
}

const EMPTY = '—';

/** The signed-in user as the shell shows them: the `/me` profile, with the login name until it arrives. */
export function useCurrentUser(): CurrentUser {
  const { data } = useMe();
  const username = useAuthStore((s) => s.user?.username);
  const displayName = data?.displayName || username || EMPTY;

  return {
    displayName,
    firstName: data?.firstName || null,
    jobTitle: data?.jobTitle || null,
    orgUnitName: data?.orgUnitName || null,
    avatarUrl: data?.avatarUrl || null,
    initials: getInitials({
      firstName: data?.firstName,
      lastName: data?.lastName,
      displayName,
    }),
  };
}
