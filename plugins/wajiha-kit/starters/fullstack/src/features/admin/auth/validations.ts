import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, { message: 'login.usernameRequired' }),
  password: z.string().min(1, { message: 'login.passwordRequired' }),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const EMPTY_LOGIN: LoginValues = { username: '', password: '' };
