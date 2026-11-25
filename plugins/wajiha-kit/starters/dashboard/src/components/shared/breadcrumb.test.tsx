import { expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen } from '@/test/render';
import { Breadcrumb, BreadcrumbLink } from './breadcrumb';

it.each(['en', 'ar'] as const)(
  'renders ancestors as links and the current page last (%s)',
  async (language) => {
    await setTestLanguage(language);
    await renderWithRouter(
      <Breadcrumb current="Disburse">
        <BreadcrumbLink to="/warehouses">Warehouses</BreadcrumbLink>
      </Breadcrumb>,
      { path: '/warehouses' },
    );

    const nav = await screen.findByRole('navigation', {
      name: tt('common.breadcrumb'),
    });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Warehouses' })).toHaveAttribute(
      'href',
      '/warehouses',
    );
    expect(screen.getByText('Disburse')).toHaveAttribute(
      'aria-current',
      'page',
    );

    const items = nav.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Warehouses');
    expect(items[1]).toHaveTextContent('Disburse');
    expect(items[1]).toHaveAttribute('aria-current', 'page');

    const separators = nav.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(1);
    expect(separators[0]).toHaveTextContent('/');
  },
);
