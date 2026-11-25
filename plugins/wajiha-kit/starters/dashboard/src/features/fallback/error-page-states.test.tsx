import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen, within } from '@/test/render';
import ForbiddenError from './403';
import NotFoundError from './404';

describe('403 and 404 pages in the 23.x layout', () => {
  it('shows the 404 alert, the request details table and the note', async () => {
    await renderWithRouter(<NotFoundError />, { path: '/404' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      tt('errorPages.states.notFound.alertTitle'),
    );
    const table = screen.getByRole('table');
    expect(
      within(table).getByRole('columnheader', {
        name: tt('errorPages.states.notFound.scope'),
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByText(tt('errorPages.states.notFound.resultValue')),
    ).toBeInTheDocument();
    expect(within(table).getByText('/404')).toHaveAttribute('dir', 'ltr');
    expect(
      screen.getAllByRole('button', {
        name: tt('errorPages.states.notFound.backToList'),
      }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: tt('nav.dashboard') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: tt('errorPages.states.notFound.title'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('errorPages.states.notFound.tip1')),
    ).toBeVisible();
  });

  it('shows the 403 permission details in Arabic', async () => {
    await setTestLanguage('ar');
    await renderWithRouter(<ForbiddenError />, { path: '/403' });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'تم رفض الوصول بسبب الصلاحيات',
    );
    expect(screen.getByText('غير مسموح')).toBeInTheDocument();
    expect(screen.getByText(/^403 · /)).toBeInTheDocument();
  });
});
