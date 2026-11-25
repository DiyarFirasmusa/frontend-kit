import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/fields/text-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from '@/lib/icons';
import { useLoginPage } from './hooks/use-login-page';

export default function LoginContainer() {
  const { t } = useTranslation();
  const page = useLoginPage();

  return (
    <div className="space-y-card">
      <div>
        <h2 className="text-h2">{t('login.title')}</h2>
        <p className="text-b2 text-text-secondary mt-1">
          {t('login.subtitle')}
        </p>
      </div>
      <Form {...page.form}>
        <form
          onSubmit={page.onSubmit}
          noValidate
          className="gap-row flex flex-col"
        >
          <TextField
            control={page.form.control}
            name="username"
            label={t('login.username')}
            placeholder={t('login.usernamePlaceholder')}
            autoComplete="username"
            dir="ltr"
          />
          <TextField
            control={page.form.control}
            name="password"
            type="password"
            required
            label={t('login.password')}
            placeholder={t('login.passwordPlaceholder')}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={page.isPending}
          >
            {page.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {t('login.submit')}
          </Button>
        </form>
      </Form>
      <p className="text-b3 text-text-secondary text-center">
        {t('login.noAccount')}
      </p>
    </div>
  );
}
