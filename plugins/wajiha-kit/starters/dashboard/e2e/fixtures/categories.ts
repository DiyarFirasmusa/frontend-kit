import { expect, type Page, type Route } from '@playwright/test';
import { endpoints } from '@/constants/api';
import type {
  AttributeDefinitionResponse,
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import { PERMS } from '../../src/constants/permissions';
import { makeJwt, type MockApi, authUrl } from './app';

/**
 * Permissions the categories and attributes pages are guarded by.
 */
export const CATEGORY_PERMISSIONS: string[] = [
  PERMS.itemCategory.read,
  PERMS.itemCategory.write,
  PERMS.itemCategory.delete,
  PERMS.attributeDefinition.read,
  PERMS.attributeDefinition.write,
  PERMS.attributeDefinition.delete,
];

export const CATEGORY_FIXTURES: ItemCategoryResponse[] = [
  {
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'معدات السلامة',
    isActive: true,
    itemCount: 184,
    childCount: 1,
  },
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'حماية اليدين',
    isActive: true,
    itemCount: 62,
    childCount: 0,
  },
  {
    id: 'cat-storage',
    parentId: null,
    code: 'STORAGE',
    name: 'أجهزة المخازن',
    isActive: true,
    itemCount: 312,
    childCount: 0,
  },
];

export const ATTRIBUTE_FIXTURES: AttributeDefinitionResponse[] = [
  {
    id: 'attr-material',
    code: 'MATERIAL',
    name: 'المادة',
    dataType: 'TEXT',
    unitLabel: null,
    isActive: true,
    options: null,
  },
  {
    id: 'attr-color',
    code: 'COLOR',
    name: 'اللون',
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
      {
        id: 'opt-grey',
        code: 'GREY',
        label: 'Grey',
        sortOrder: 3,
        isActive: true,
      },
    ],
  },
  {
    id: 'attr-weight',
    code: 'WEIGHT',
    name: 'الوزن',
    dataType: 'NUMBER',
    unitLabel: 'kg',
    isActive: true,
    options: null,
  },
];

/** Assignments of cat-hand: one inherited from cat-safety, one owned. */
export const ASSIGNMENT_FIXTURES: CategoryAttributeResponse[] = [
  {
    id: 'asg-1',
    sourceCategoryId: 'cat-safety',
    inherited: true,
    attributeDefinitionId: 'attr-material',
    attributeCode: 'MATERIAL',
    attributeName: 'المادة',
    dataType: 'TEXT',
    isRequired: true,
    isVariantAxis: false,
    sortOrder: 0,
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
  },
  {
    id: 'asg-2',
    sourceCategoryId: 'cat-hand',
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeCode: 'COLOR',
    attributeName: 'اللون',
    dataType: 'OPTION',
    isRequired: false,
    isVariantAxis: true,
    sortOrder: 1,
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
  },
];

function segmentsOf(route: Route): { pathname: string; parts: string[] } {
  const { pathname } = new URL(route.request().url());
  return { pathname, parts: pathname.split('/').filter(Boolean) };
}

/**
 * `MockApi` keeps its Page private and exposes only `json`/`login`, but the
 * dispatching handlers below need `page.route` for method-level branching.
 * TODO(foundation): expose `page` on MockApi (no tracked issue yet) and drop
 * this cast. Until then fail loudly instead of registering routes on undefined.
 */
function pageOf(mockApi: MockApi): Page {
  const { page } = mockApi as unknown as { page?: Page };
  if (!page) {
    throw new Error(
      'MockApi no longer exposes `page`; update categories fixture',
    );
  }
  return page;
}

function bodyOf(route: Route): Record<string, unknown> {
  return (route.request().postDataJSON() ?? {}) as Record<string, unknown>;
}

/**
 * Stubs for the categories and attributes pages. Each resource has a single
 * handler that dispatches on HTTP method and URL pathname, so tests can assert
 * on the requests the page sends.
 *
 * Partly stateful: category POST and attribute option POST append to in-memory
 * arrays, so later GETs in the same test see them. All other writes (category
 * PUT/DELETE, attribute PUT/DELETE, assignment POST/PUT/DELETE, option PUT/DELETE)
 * only echo the request body and do not persist between requests.
 */
export async function mockCategories(mockApi: MockApi): Promise<void> {
  const categories = [...CATEGORY_FIXTURES];
  const assignments = [...ASSIGNMENT_FIXTURES];
  const attributes = ATTRIBUTE_FIXTURES.map((attribute) => ({
    ...attribute,
    options: attribute.options?.map((option) => ({ ...option })) ?? null,
  }));

  const page = pageOf(mockApi);

  await page.route('**/api/item-categories**', async (route) => {
    const { parts } = segmentsOf(route);
    const method = route.request().method();
    // parts: ['api', 'item-categories', id?, 'attributes'?, assignmentId?]
    if (parts.length === 2) {
      if (method === 'GET') {
        await route.fulfill({ json: categories });
        return;
      }
      if (method === 'POST') {
        const created: ItemCategoryResponse = {
          id: `cat-${categories.length + 1}`,
          isActive: true,
          name: null,
          code: null,
          parentId: null,
          ...bodyOf(route),
        } as ItemCategoryResponse;
        categories.push(created);
        await route.fulfill({ status: 201, json: created });
        return;
      }
    }
    if (parts[3] === 'attributes') {
      if (parts.length === 4 && method === 'GET') {
        await route.fulfill({ json: assignments });
        return;
      }
      if (parts.length === 4 && method === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            id: 'asg-new',
            sourceCategoryId: parts[2],
            inherited: false,
            ...bodyOf(route),
          },
        });
        return;
      }
      if (parts.length === 5 && method === 'PUT') {
        const body = bodyOf(route);
        await route.fulfill({
          json: {
            id: parts[4],
            sourceCategoryId: parts[2],
            inherited: false,
            ...body,
          },
        });
        return;
      }
      if (parts.length === 5 && method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' });
        return;
      }
    }
    if (parts.length === 3 && method === 'PUT') {
      await route.fulfill({
        json: { id: parts[2], ...bodyOf(route) },
      });
      return;
    }
    if (parts.length === 3 && method === 'DELETE') {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.fulfill({ status: 404, json: { message: 'Not found' } });
  });

  await page.route('**/api/attribute-definitions**', async (route) => {
    const { parts } = segmentsOf(route);
    const method = route.request().method();
    // parts: ['api', 'attribute-definitions', id?, 'options'?, optionId?]
    if (parts.length === 2 && method === 'GET') {
      await route.fulfill({ json: attributes });
      return;
    }
    if (parts.length === 2 && method === 'POST') {
      const created = {
        id: `attr-${attributes.length + 1}`,
        options: null,
        ...bodyOf(route),
      };
      await route.fulfill({ status: 201, json: created });
      return;
    }
    if (parts.length === 3 && method === 'PUT') {
      await route.fulfill({ json: { id: parts[2], ...bodyOf(route) } });
      return;
    }
    if (parts.length === 3 && method === 'DELETE') {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    if (parts[3] === 'options') {
      const definition = attributes.find(
        (attribute) => attribute.id === parts[2],
      );
      if (parts.length === 4 && method === 'POST') {
        const body = bodyOf(route);
        const option = {
          id: 'opt-new',
          isActive: true,
          sortOrder: null,
          ...body,
        };
        definition?.options?.push(
          option as NonNullable<typeof definition.options>[number],
        );
        await route.fulfill({ status: 201, json: option });
        return;
      }
      if (parts.length === 5 && method === 'PUT') {
        await route.fulfill({ json: { id: parts[4], ...bodyOf(route) } });
        return;
      }
      if (parts.length === 5 && method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' });
        return;
      }
    }
    await route.fulfill({ status: 404, json: { message: 'Not found' } });
  });
}

/**
 * Signs in through the real login form with the given permissions. Mirrors
 * `loginAs` in e2e/fixtures/app.ts, but the token carries `permissions`.
 */
export async function signInWithPermissions(
  page: Page,
  mockApi: MockApi,
  permissions: string[],
): Promise<void> {
  await mockApi.json(`${authUrl(endpoints.auth.login)}`, {
    access: makeJwt({ permissions }),
    refresh: 'refresh-token',
    userId: 'user-1',
    tenantId: 'tenant-1',
    roles: ['ADMIN'],
    permissions,
  });
  await page.goto('/login');
  await page.getByLabel(/^(username|اسم المستخدم)\s*\*?$/i).fill('admin');
  await page.getByLabel(/^(password|كلمة المرور)\s*\*?$/i).fill('secret');
  await page.getByRole('button', { name: /sign in|تسجيل الدخول/i }).click();
  await expect(page).toHaveURL(/\/$/);
}
