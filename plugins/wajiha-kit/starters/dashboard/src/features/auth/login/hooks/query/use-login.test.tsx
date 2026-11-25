import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { makeJwt, makeLoginResponse } from '@/test/fixtures/auth';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient } from '@/test/render';
import { useLogin } from './use-login';

function mount() {
  const queryClient = createTestQueryClient();
  return renderHook(() => useLogin(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useLogin', () => {
  it('stores tokens, tenant and username, then permissions and roles, after success', async () => {
    const response = makeLoginResponse({
      roles: ['HR'],
      permissions: ['leave:read'],
    });
    server.use(
      http.post(authApi(endpoints.auth.login), () =>
        HttpResponse.json(response),
      ),
    );
    const { result } = mount();
    await act(async () => {
      await result.current.mutateAsync({
        username: 'admin',
        password: 'secret',
      });
    });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: response.access,
      refreshToken: response.refresh,
      tenantId: response.tenantId,
      user: {
        id: response.userId,
        username: 'admin',
      },
    });
    expect(usePermissionStore.getState()).toMatchObject({
      roles: ['HR'],
      permissions: ['leave:read'],
    });
  });

  it('leaves the session and permissions empty on failure', async () => {
    server.use(
      http.post(
        authApi(endpoints.auth.login),
        () => new HttpResponse(null, { status: 401 }),
      ),
    );
    const { result } = mount();
    act(() => {
      result.current.mutate({ username: 'admin', password: 'wrong' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().tenantId).toBeNull();
    expect(usePermissionStore.getState().permissions).toEqual([]);
  });

  it('signs in from a body that has only access, refresh and permissions', async () => {
    const access = makeJwt({
      sub: 'user-1',
      tenant_id: 'tenant-7',
      roles: ['SUPERADMIN'],
    });
    server.use(
      http.post(authApi(endpoints.auth.login), () =>
        HttpResponse.json({
          access,
          refresh: 'refresh-token',
          permissions: ['employee:read'],
        }),
      ),
    );
    const { result } = mount();
    await act(async () => {
      await result.current.mutateAsync({
        username: 'admin',
        password: 'secret',
      });
    });

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe(access);
    });
    expect(useAuthStore.getState().tenantId).toBe('tenant-7');
    expect(usePermissionStore.getState().roles).toEqual(['SUPERADMIN']);
    expect(usePermissionStore.getState().permissions).toEqual([
      'employee:read',
    ]);
  });
});
