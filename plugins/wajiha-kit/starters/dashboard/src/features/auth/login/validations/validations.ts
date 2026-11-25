import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, { message: 'login.usernameRequired' }),
  password: z.string().min(1, { message: 'login.passwordRequired' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const defaultLoginForm: LoginFormData = {
  username: '',
  password: '',
};
