import { HttpResponse, http, type JsonBodyType } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, within } from '@/test/render';
import CategoriesContainer from './index';

const definitions = [
  {
    id: 'attr-color',
    code: 'COLOR',
    name: 'Color',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: [
      {
        id: 'opt-black',
        code: 'BLACK',
        label: 'Black',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'opt-blue',
        code: 'BLUE',
        label: 'Blue',
        sortOrder: 2,
        isActive: true,
      },
    ],
  },
  {
    id: 'attr-weight',
    code: 'WEIGHT',
    name: 'Weight',
    dataType: 'NUMBER',
    unitLabel: 'kg',
    isActive: true,
    options: null,
  },
];

const definitionsUrl = api(endpoints.attributeDefinitions.list);
const categoriesUrl = api(endpoints.itemCategories.list);

// One handler per method + pathname; MSW ignores query strings when matching.
function mockApi(
  o: { definitionsStatus?: number; definitions?: JsonBodyType } = {},
) {
  server.use(
    http.get(definitionsUrl, () =>
      HttpResponse.json(o.definitions ?? definitions, {
        status: o.definitionsStatus ?? 200,
      }),
    ),
    http.get(categoriesUrl, () => HttpResponse.json([])),
  );
}

function render() {
  return renderWithRouter(<CategoriesContainer initialTab="attributes" />, {
    path: '/attributes',
  });
}

describe('CategoriesContainer (attributes tab)', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({
      permissions: [
        PERMS.itemCategory.read,
        PERMS.attributeDefinition.read,
        PERMS.attributeDefinition.write,
        PERMS.attributeDefinition.delete,
      ],
    });
  });

  it('renders attribute names and Arabic type labels', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    mockApi();
    await render();

    expect(
      await screen.findByText(tt('categories.attributes.title')),
    ).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('خيار')).toBeInTheDocument();
    expect(screen.getByText('رقم')).toBeInTheDocument();
    await setTestLanguage('en');
  });

  it('opens the options dialog listing the options of an OPTION attribute', async () => {
    mockApi();
    const { user } = await render();

    const row = await screen.findByRole('row', { name: /Color/ });
    await user.click(
      within(row).getByRole('button', {
        name: tt('categories.assignments.editOptions'),
      }),
    );

    expect(
      await screen.findByText(
        tt('categories.options.title', { name: 'Color' }),
      ),
    ).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Black')).toBeInTheDocument();
    expect(within(dialog).getByText('Blue')).toBeInTheDocument();
  });

  it('opens the create attribute form from the header action', async () => {
    mockApi();
    const { user } = await render();

    await user.click(
      await screen.findByRole('button', {
        name: tt('categories.actions.addAttribute'),
      }),
    );

    expect(
      await screen.findByText(tt('categories.attributeForm.createTitle')),
    ).toBeInTheDocument();
  });

  it('shows the error state when the definitions request fails', async () => {
    mockApi({ definitionsStatus: 500 });
    await render();

    expect(await screen.findByText(tt('common.loadError'))).toBeInTheDocument();
  });
});
