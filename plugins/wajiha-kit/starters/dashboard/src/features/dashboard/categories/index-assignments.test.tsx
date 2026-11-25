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
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'Safety equipment',
  },
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'Hand protection',
  },
];

const assignments = [
  {
    id: 'asg-1',
    sourceCategoryId: 'cat-safety',
    inherited: true,
    attributeDefinitionId: 'attr-material',
    attributeName: 'Material',
    dataType: 'TEXT',
    isRequired: true,
    isVariantAxis: false,
  },
  {
    id: 'asg-2',
    sourceCategoryId: 'cat-hand',
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeName: 'Color',
    dataType: 'OPTION',
    isRequired: false,
    isVariantAxis: true,
  },
];

const listUrl = api(endpoints.itemCategories.list);
const attributesUrl = api(endpoints.itemCategories.attributes('cat-hand'));
const attributeRowUrl = api(
  endpoints.itemCategories.attribute('cat-hand', 'asg-2'),
);
const definitionsUrl = api(endpoints.attributeDefinitions.list);

function mockApi(o: { onPut?: (body: unknown) => void } = {}) {
  server.use(
    http.get(listUrl, () => HttpResponse.json(categories)),
    http.get(attributesUrl, () => HttpResponse.json(assignments)),
    http.put(attributeRowUrl, async ({ request }) => {
      o.onPut?.(await request.json());
      return HttpResponse.json(assignments[1]);
    }),
    http.get(definitionsUrl, () => HttpResponse.json([])),
  );
}

const render = () =>
  renderWithRouter(<CategoriesContainer initialTab="categories" />, {
    path: '/categories',
  });

describe('CategoriesContainer (assignments)', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: Object.values(PERMS.itemCategory) });
  });

  it('shows assignments with the inherited row marked read-only', async () => {
    mockApi();
    const { user } = await render();
    await user.click(await screen.findByText('Hand protection'));

    expect(
      await screen.findByText(tt('categories.assignments.inheritedReadonly')),
    ).toBeInTheDocument();
  });

  it('sends a PUT when the own row required switch is toggled', async () => {
    const bodies: unknown[] = [];
    mockApi({ onPut: (body) => bodies.push(body) });
    const { user } = await render();
    await user.click(await screen.findByText('Hand protection'));

    const row = await screen.findByRole('row', { name: /Color/ });
    await user.click(
      within(row).getByRole('switch', {
        name: tt('categories.assignments.col.required'),
      }),
    );

    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    expect(bodies[0]).toMatchObject({
      attributeDefinitionId: 'attr-color',
      isRequired: true,
      isVariantAxis: true,
    });
  });
});
