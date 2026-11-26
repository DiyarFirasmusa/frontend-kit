import { useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { safeRedirect } from '@/guards/route-guards';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import {
  defaultLoginForm,
  loginSchema,
  type LoginFormData,
} from '../validations/validations';
import { useLogin } from './query/use-login';

export function useLoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  // Not strict: the page also renders under test routers without the schema.
  const { redirect } = useSearch({ strict: false });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginForm,
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        void navigate({ href: safeRedirect(redirect), replace: true });
      },
    });
  });

  return { form, onSubmit, isPending: login.isPending };
}
