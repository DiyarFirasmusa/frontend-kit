import { z } from '@/shared/lib/zod';

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'settings.nameRequired' })
    .max(120, { message: 'settings.nameMax' }),
  email: z
    .string()
    .trim()
    .max(150, { message: 'settings.emailMax' })
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'settings.emailInvalid',
    }),
  jobTitle: z.string().trim().max(120, { message: 'settings.jobTitleMax' }),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const EMPTY_PROFILE: ProfileValues = { name: '', email: '', jobTitle: '' };
