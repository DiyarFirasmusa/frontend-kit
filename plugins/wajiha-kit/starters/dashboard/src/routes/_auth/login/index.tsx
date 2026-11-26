import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import LoginContainer from '@/features/auth/login';
import { requireGuest } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { withFallback } from '@/lib/list-search';

/* `redirect` is where the user was when the session ended. It is only read
   here; useLoginPage passes it through safeRedirect before navigating. The
   router JSON-parses search values, so a non-string falls back to ''
   (safeRedirect sends that home). */
const loginSearchSchema = z.object({
  redirect: withFallback(z.string().optional(), ''),
});

export const Route = createFileRoute('/_auth/login/')({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    requireGuest();
  },
  loader: () => loadFeatureLocale('auth/login'),
  component: LoginContainer,
});
