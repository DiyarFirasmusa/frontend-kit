import { describe, expect, it } from 'vitest';
import { screen } from '@/test/render';
import { renderAtUrl } from '@/test/render-router';
import { AdminMessage } from './admin-message';

// The "not found" message is rendered for an unknown admin URL, where the admin's own text bundle was never
// loaded (the admin layout's beforeLoad does not run for it). So it is tested with the public site's i18n
// instance only: no raw key may show, and the page must be a <main> of its own.
describe('<AdminMessage kind="notFound">', () => {
  it.each([
    ['en', 'Page not found', 'Back to the admin'],
    ['ar', 'الصفحة غير موجودة', 'العودة إلى لوحة الإدارة'],
  ] as const)(
    'speaks %s without the admin text loaded, inside its own main',
    async (locale, title, back) => {
      await renderAtUrl(<AdminMessage kind="notFound" />, {
        url: `/${locale}/admin/nope`,
        siteOnly: locale,
      });
      expect(await screen.findByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
      expect(screen.getByRole('link', { name: back })).toHaveAttribute('href', `/${locale}/admin`);
      expect(document.body).not.toHaveTextContent(/\b(admin|error)\.[a-zA-Z]+\b/u);
    },
  );

  it('the no-access message sits inside the shell main, so it adds no second main', async () => {
    await renderAtUrl(<AdminMessage kind="forbidden" />, { url: '/en/admin/forbidden' });
    expect(await screen.findByRole('heading', { level: 1, name: 'No access' })).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
