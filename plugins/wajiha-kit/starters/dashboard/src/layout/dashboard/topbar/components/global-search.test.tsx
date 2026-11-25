import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import { mockSearch } from '../topbar-test-utils';
import { GlobalSearch } from './global-search';

const WAIT = { timeout: 3000 };

describe('GlobalSearch', () => {
  it('shows grouped results after the debounce and sends one request', async () => {
    const { requests } = mockSearch();
    const { user } = await renderWithRouter(<GlobalSearch />, { path: '/' });

    await user.type(screen.getByRole('combobox'), 'ce');

    expect(
      await screen.findByText('Central warehouse', {}, WAIT),
    ).toBeInTheDocument();
    expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    expect(
      screen.getByText(tt('search.groups.warehouses')),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('search.groups.units'))).toBeInTheDocument();
    expect(screen.getByText(tt('common.inactive'))).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.get('q')).toBe('ce');
  });

  it('opens the warehouse page when a warehouse result is chosen', async () => {
    mockSearch();
    const { user, router } = await renderWithRouter(<GlobalSearch />, {
      path: '/',
    });

    await user.type(screen.getByRole('combobox'), 'ce');
    await user.click(await screen.findByText('Central warehouse', {}, WAIT));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/warehouses/wh-1');
    });
  });

  it('opens the supplier list when a supplier result is chosen', async () => {
    mockSearch();
    const { user, router } = await renderWithRouter(<GlobalSearch />, {
      path: '/',
    });

    await user.type(screen.getByRole('combobox'), 'ac');
    await user.click(await screen.findByText('Acme Supplies', {}, WAIT));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/suppliers');
    });
  });

  it('shows the empty state when nothing matches', async () => {
    mockSearch({ warehouses: [], suppliers: [], categories: [], units: [] });
    const { user } = await renderWithRouter(<GlobalSearch />, { path: '/' });

    await user.type(screen.getByRole('combobox'), 'zz');

    expect(
      await screen.findByText(tt('search.empty'), {}, WAIT),
    ).toBeInTheDocument();
  });

  it('shows the error state when the search fails', async () => {
    mockSearch({ status: 500 });
    const { user } = await renderWithRouter(<GlobalSearch />, { path: '/' });

    await user.type(screen.getByRole('combobox'), 'zz');

    expect(
      await screen.findByText(tt('search.error'), {}, WAIT),
    ).toBeInTheDocument();
  });

  it('renders the Arabic group headings', async () => {
    await setTestLanguage('ar');
    mockSearch();
    const { user } = await renderWithRouter(<GlobalSearch />, { path: '/' });

    await user.type(screen.getByRole('combobox'), 'ce');

    expect(
      await screen.findByText(tt('search.groups.suppliers'), {}, WAIT),
    ).toBeInTheDocument();
  });
});
