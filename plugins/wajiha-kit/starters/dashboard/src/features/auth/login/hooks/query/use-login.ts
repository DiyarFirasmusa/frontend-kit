import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import type { User } from '@/types/common';
import { loginService } from '../../services/login.service';
import { resolveLoginSession } from '../../utils/resolve-session';
import type { LoginFormData } from '../../validations/validations';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (values: LoginFormData) => loginService.login(values),
    onSuccess: (res, values) => {
      const session = resolveLoginSession(res);
      const user: User = {
        id: session.userId,
        username: values.username,
      };
      setSession({
        user,
        accessToken: res.access,
        refreshToken: res.refresh,
        tenantId: session.tenantId,
      });
      usePermissionStore.getState().setPermissions({
        roles: session.roles,
        permissions: session.permissions,
      });
    },
  });
}
