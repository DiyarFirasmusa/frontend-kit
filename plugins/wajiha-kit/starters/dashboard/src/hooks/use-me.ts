import { useQuery } from '@tanstack/react-query';
import { qk, referenceQueryOptions } from '@/constants/query-keys';
import { fetchMe } from '@/services/me.service';
import { useAuthStore } from '@/store/auth-store';

/** The signed-in user (`GET /me`). One cached request is shared by the shell, home and profile. */
export function useMe() {
  const isSignedIn = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: qk.me.all,
    queryFn: ({ signal }) => fetchMe({ signal }),
    enabled: isSignedIn,
    ...referenceQueryOptions,
  });
}
