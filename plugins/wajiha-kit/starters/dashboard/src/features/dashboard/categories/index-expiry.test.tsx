import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import CategoriesContainer from './index';

const categories = [
  {
    id: 'cat-med',
    parentId: null,
    code: 'MED',
    name: 'Medicines',
    isActive: true,
    expiryAlertDays: 60,
  },
  {
    id: 'cat-tools',
    parentId: null,
    code: 'TLS',
    name: 'Tools',
    isActive: true,
    expiryAlertDays: null,
  },
];

function mockApi() {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    http.get(api(endpoints.itemCategories.list), () =>
      HttpResponse.json(categories),
    ),
    http.get(api(endpoints.itemCategories.attributes('cat-med')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.itemCategories.attributes('cat-tools')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.attributeDefinitions.list), () =>
      HttpResponse.json([]),
    ),
    http.put(
      api(endpoints.itemCategories.update('cat-med')),
      async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(categories[0]);
      },
    ),
  );
  return bodies;
}

function expiryLine(): HTMLElement {
  return screen.getByText(new RegExp(tt('categories.detail.expiryAlertDays')));
}

describe('CategoriesContainer (expiry alert window)', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: Object.values(PERMS.itemCategory) });
  });

  it('shows the window of the selected category and — when it has none', async () => {
    mockApi();
    const { user } = await renderWithRouter(
      <CategoriesContainer initialTab="categories" />,
      { path: '/categories' },
    );

    expect(
      await screen.findByRole('heading', { name: 'Medicines' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(expiryLine()).toHaveTextContent(
        tt('categories.detail.expiryAlertDaysValue', { days: 60 }),
      );
    });

    await user.click(screen.getByText('Tools'));
    await waitFor(() => {
      expect(within(expiryLine()).getByText('—')).toBeInTheDocument();
    });
  });

  it('sends 0 when the stored window is cleared on edit', async () => {
    const bodies = mockApi();
    const { user } = await renderWithRouter(
      <CategoriesContainer initialTab="categories" />,
      { path: '/categories' },
    );

    await screen.findByRole('heading', { name: 'Medicines' });
    await user.click(
      await screen.findByRole('button', { name: tt('common.edit') }),
    );
    const input = await screen.findByRole('spinbutton', {
      name: tt('categories.form.expiryAlertDays'),
    });
    expect(input).toHaveValue(60);
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: tt('common.save') }));

    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    expect(bodies[0]).toMatchObject({ name: 'Medicines', expiryAlertDays: 0 });
  });
});
