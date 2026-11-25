import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { getHomePath } from '@/guards/route-guards';
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

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginForm,
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        void navigate({ to: getHomePath() });
      },
    });
  });

  return { form, onSubmit, isPending: login.isPending };
}
