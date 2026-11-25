import { beforeEach, describe, expect, it } from 'vitest';
import { BarChart } from '@/lib/icons';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen } from '@/test/render';
import type { NavGroup, NavItem } from '../types/types';
import { SidebarAccordion } from './sidebar-accordion';

const home: NavItem = {
  to: '/',
  labelKey: 'nav.dashboard',
  icon: BarChart,
};

const GROUPS: NavGroup[] = [
  {
    id: 'operations',
    labelKey: 'nav.groups.operations',
    icon: BarChart,
    items: [
      {
        to: '/approvals',
        labelKey: 'nav.approvals',
        icon: BarChart,
      },
    ],
  },
  {
    id: 'stock',
    labelKey: 'nav.groups.stock',
    icon: BarChart,
    items: [
      { to: '/stock/on-hand', labelKey: 'nav.stockOnHand', icon: BarChart },
      {
        to: '/stock/movements',
        labelKey: 'nav.stockMovements',
        icon: BarChart,
      },
    ],
  },
  {
    id: 'products',
    labelKey: 'nav.groups.products',
    icon: BarChart,
    items: [{ to: '/items', labelKey: 'nav.items', icon: BarChart }],
  },
  {
    id: 'warehouses',
    labelKey: 'nav.groups.warehouses',
    icon: BarChart,
    to: '/warehouses',
    items: [{ to: '/locations', labelKey: 'nav.locations', icon: BarChart }],
  },
];

beforeEach(async () => {
  await setTestLanguage('en');
});

describe('SidebarAccordion', () => {
  it('opens only one group at a time', async () => {
    const { user } = await renderWithRouter(
      <SidebarAccordion groups={GROUPS} path="/" />,
      { path: '/' },
    );
    const stockHeader = screen.getByRole('button', {
      name: tt('nav.groups.stock'),
    });
    const productsHeader = screen.getByRole('button', {
      name: tt('nav.groups.products'),
    });

    await user.click(stockHeader);
    expect(stockHeader).toHaveAttribute('aria-expanded', 'true');

    await user.click(productsHeader);
    expect(productsHeader).toHaveAttribute('aria-expanded', 'true');
    expect(stockHeader).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the group containing the current route and marks the item', async () => {
    await renderWithRouter(<SidebarAccordion groups={GROUPS} path="/items" />, {
      path: '/items',
    });
    expect(
      screen.getByRole('button', { name: tt('nav.groups.products') }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: tt('nav.items') })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('toggles aria-expanded on click and links aria-controls to the panel', async () => {
    const { user } = await renderWithRouter(
      <SidebarAccordion groups={GROUPS} path="/" />,
      { path: '/' },
    );
    const header = screen.getByRole('button', {
      name: tt('nav.groups.products'),
    });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    const panelId = header.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.querySelector(`[id="${panelId}"]`)).not.toBeNull();
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('links a group header to its own page while the toggle still expands it', async () => {
    const { user } = await renderWithRouter(
      <SidebarAccordion groups={GROUPS} path="/" />,
      { path: '/' },
    );
    const link = screen.getByRole('link', {
      name: tt('nav.groups.warehouses'),
    });
    expect(link).toHaveAttribute('href', '/warehouses');
    const toggle = screen.getByRole('button', {
      name: tt('nav.groups.warehouses'),
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('hides a group whose items are all filtered out', async () => {
    await renderWithRouter(
      <SidebarAccordion
        groups={[{ ...GROUPS[1], items: [] }, GROUPS[2]]}
        path="/"
      />,
      { path: '/' },
    );
    expect(
      screen.queryByRole('button', { name: tt('nav.groups.stock') }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: tt('nav.groups.products') }),
    ).toBeInTheDocument();
  });

  it('renders the home link only when a home item is passed', async () => {
    const { unmount } = await renderWithRouter(
      <SidebarAccordion groups={GROUPS} path="/" />,
      { path: '/' },
    );
    expect(
      screen.queryByRole('link', { name: tt('nav.dashboard') }),
    ).not.toBeInTheDocument();
    unmount();
    await renderWithRouter(
      <SidebarAccordion home={home} groups={GROUPS} path="/" />,
      { path: '/' },
    );
    expect(
      screen.getByRole('link', { name: tt('nav.dashboard') }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
