import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import type { Locale } from '@/shared/lib/i18n/languages';
import { zodResolver } from '@/shared/lib/vendor/zod-resolver';
import { safeReturnPath } from '../guards/route-guards';
import { useAuthStore } from '../store/auth-store';
import { usePermissionStore } from '../store/permission-store';
import { login } from './login.service';
import type { LoginValues } from './validations';
import { EMPTY_LOGIN, loginSchema } from './validations';

/** The login form: validate, sign in, store the session and its rights, go back where the user was. */
export function useLoginPage({ locale, redirect }: { locale: Locale; redirect?: string }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: EMPTY_LOGIN,
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setSession({ user: response.user, accessToken: response.accessToken });
      usePermissionStore.getState().setPermissions({
        roles: response.roles,
        permissions: response.permissions,
      });
      void navigate({ href: safeReturnPath(locale, redirect), replace: true });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!mutation.isPending) {
      mutation.mutate(values);
    }
  });

  return { form, onSubmit, isPending: mutation.isPending };
}
