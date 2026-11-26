import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/fields/text-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsPage } from './use-settings-page';

export function SettingsPage() {
  const { t } = useTranslation();
  const page = useSettingsPage();

  return (
    <section className="gap-card flex max-w-2xl flex-col">
      <header>
        <h1 className="page-title">{t('settings.title')}</h1>
        <p className="page-subtitle">{t('settings.subtitle')}</p>
      </header>

      <div className="surface-card gap-row flex flex-col">
        <h2 className="text-h3">{t('settings.profileTitle')}</h2>
        {page.isError ? (
          <div role="alert" className="gap-row flex flex-col items-start">
            <p className="text-b1">{t('settings.loadError')}</p>
            <Button variant="outline" onClick={page.retry}>
              {t('ui.tryAgain')}
            </Button>
          </div>
        ) : page.isLoading ? (
          <Skeleton className="h-56" />
        ) : (
          <Form {...page.form}>
            <form onSubmit={page.onSubmit} noValidate className="gap-row flex flex-col">
              <TextField
                control={page.form.control}
                name="name"
                label={t('settings.name')}
                autoComplete="name"
                maxLength={120}
                required
              />
              <TextField
                control={page.form.control}
                name="email"
                type="email"
                label={t('settings.email')}
                autoComplete="email"
                dir="ltr"
                maxLength={150}
              />
              <TextField
                control={page.form.control}
                name="jobTitle"
                label={t('settings.jobTitle')}
                autoComplete="organization-title"
                maxLength={120}
              />
              <div>
                <Button type="submit" disabled={page.isSaving}>
                  {page.isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {t('ui.save')}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </section>
  );
}
