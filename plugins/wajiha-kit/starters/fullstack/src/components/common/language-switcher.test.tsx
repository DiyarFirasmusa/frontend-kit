import { describe, expect, it } from 'vitest';
import { screen } from '@/test/render';
import { renderAtUrl } from '@/test/render-router';
import { LanguageSwitcher } from './language-switcher';

describe('<LanguageSwitcher>', () => {
  it('links to the same page in the other language, query string included', async () => {
    await renderAtUrl(<LanguageSwitcher locale="en" />, {
      url: '/en/admin/suppliers?status=inactive&page=2',
    });
    expect(await screen.findByRole('link')).toHaveAttribute(
      'href',
      '/ar/admin/suppliers?status=inactive&page=2',
    );
  });

  it('keeps the login ?redirect= so the user still lands where they were going', async () => {
    await renderAtUrl(<LanguageSwitcher locale="ar" />, {
      url: '/ar/admin/login?redirect=%2Far%2Fadmin%2Fsuppliers',
    });
    expect(await screen.findByRole('link')).toHaveAttribute(
      'href',
      '/en/admin/login?redirect=%2Far%2Fadmin%2Fsuppliers',
    );
  });

  it('links to the plain page when there is no query string', async () => {
    await renderAtUrl(<LanguageSwitcher locale="en" />, { url: '/en/about' });
    expect(await screen.findByRole('link')).toHaveAttribute('href', '/ar/about');
  });
});
