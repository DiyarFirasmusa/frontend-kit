import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { signIn } from '@/test/fixtures/auth';
import { createHookWrapper } from '@/test/hook-wrapper';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { useCurrentUser } from './use-current-user';

describe('useCurrentUser', () => {
  it('uses the profile from /me once it arrives', async () => {
    signIn();
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    expect(result.current.displayName).toBe('admin');
    await waitFor(() => {
      expect(result.current).toEqual({
        displayName: 'Ali Karkhi',
        firstName: 'Ali',
        jobTitle: 'Storekeeper',
        orgUnitName: 'Baghdad branch',
        avatarUrl: null,
        initials: 'AK',
      });
    });
  });

  it('keeps the login name when /me has no display name', async () => {
    signIn();
    let calls = 0;
    server.use(
      http.get(api(endpoints.auth.me), () => {
        calls += 1;
        return HttpResponse.json({ userId: 'user-1' });
      }),
    );
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(calls).toBe(1);
    });
    expect(result.current.displayName).toBe('admin');
    expect(result.current.jobTitle).toBeNull();
    expect(result.current.initials).toBe('AD');
  });

  it('does not call /me without a session', () => {
    let calls = 0;
    server.use(
      http.get(api(endpoints.auth.me), () => {
        calls += 1;
        return HttpResponse.json({});
      }),
    );
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    expect(result.current.displayName).toBe('—');
    expect(result.current.initials).toBe('—');
    expect(calls).toBe(0);
  });
});
