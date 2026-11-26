import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { TextField } from '@/components/fields/text-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from '@/components/ui/icons';
import { siteName } from '@/config/site.config';
import { publicEnv } from '@/shared/env/public-env';
import type { Locale } from '@/shared/lib/i18n/languages';
import { useLoginPage } from './use-login-page';

export function LoginPage({ locale, redirect }: { locale: Locale; redirect?: string }) {
  const { t } = useTranslation();
  const page = useLoginPage({ locale, redirect });

  return (
    <div className="bg-background p-row flex min-h-dvh flex-col">
      <div className="gap-field flex justify-end">
        <LanguageSwitcher locale={locale} />
        <ThemeToggle />
      </div>
      <main id="admin-main" tabIndex={-1} className="grid flex-1 place-items-center">
        <div className="surface-card shadow-mid p-card gap-card flex w-full max-w-md flex-col">
          <div className="gap-field flex items-center">
            <img src="/favicon.svg" alt="" width="40" height="40" className="size-10" />
            <div>
              <p className="text-b3 text-text-muted">{siteName(locale)}</p>
              <h1 className="text-h2">{t('login.title')}</h1>
            </div>
          </div>
          <p className="text-b2 text-text-secondary">{t('login.subtitle')}</p>
          <Form {...page.form}>
            <form onSubmit={page.onSubmit} noValidate className="gap-row flex flex-col">
              <TextField
                control={page.form.control}
                name="username"
                label={t('login.username')}
                autoComplete="username"
                dir="ltr"
                required
              />
              <TextField
                control={page.form.control}
                name="password"
                type="password"
                label={t('login.password')}
                autoComplete="current-password"
                required
              />
              <Button type="submit" size="lg" className="w-full" disabled={page.isPending}>
                {page.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {t('login.submit')}
              </Button>
            </form>
          </Form>
          {publicEnv.VITE_ADMIN_API_MOCK ? (
            <p className="text-b3 text-text-secondary">{t('login.demoHint')}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
