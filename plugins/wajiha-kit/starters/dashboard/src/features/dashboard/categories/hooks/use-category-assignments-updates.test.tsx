import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { signIn } from '@/test/fixtures/auth';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  ASSIGNMENTS,
  createGate,
  mockList,
  renderAssignments,
} from './use-category-assignments.fixtures';

const OWN_PUT = api(endpoints.itemCategories.attribute('cat-hand', 'asg-2'));

describe('useCategoryAssignments updates', () => {
  it('sends a PUT with the other flags preserved when setting required', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    let body: unknown = null;
    server.use(
      http.put(OWN_PUT, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...ASSIGNMENTS[1], isRequired: true });
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const row = result.current.rows[1];
    if (!row) {
      throw new Error('expected own row');
    }
    act(() => {
      result.current.setRequired(row, true);
    });

    await waitFor(() => {
      expect(body).toEqual({
        attributeDefinitionId: 'attr-color',
        isRequired: true,
        isVariantAxis: true,
        sortOrder: 2,
      });
    });
  });

  it('sends a PUT that keeps isRequired when setting the variant axis', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    let body: unknown = null;
    server.use(
      http.put(OWN_PUT, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...ASSIGNMENTS[1], isVariantAxis: false });
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const row = result.current.rows[1];
    if (!row) {
      throw new Error('expected own row');
    }
    act(() => {
      result.current.setVariantAxis(row, false);
    });

    await waitFor(() => {
      expect(body).toEqual({
        attributeDefinitionId: 'attr-color',
        isRequired: false,
        isVariantAxis: false,
        sortOrder: 2,
      });
    });
  });

  it('sends the combined flags when two quick toggles hit the same row', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    const bodies: unknown[] = [];
    server.use(
      http.put(OWN_PUT, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(ASSIGNMENTS[1]);
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const row = result.current.rows[1];
    if (!row) {
      throw new Error('expected own row');
    }
    act(() => {
      result.current.setRequired(row, true);
      result.current.setVariantAxis(row, false);
    });

    await waitFor(() => {
      expect(bodies).toHaveLength(2);
    });
    expect(bodies).toContainEqual({
      attributeDefinitionId: 'attr-color',
      isRequired: true,
      isVariantAxis: true,
      sortOrder: 2,
    });
    expect(bodies).toContainEqual({
      attributeDefinitionId: 'attr-color',
      isRequired: true,
      isVariantAxis: false,
      sortOrder: 2,
    });
  });

  it('reports isUpdating while a PUT is in flight', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    const gate = createGate();
    server.use(
      http.put(OWN_PUT, async () => {
        await gate.promise;
        return HttpResponse.json(ASSIGNMENTS[1]);
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const row = result.current.rows[1];
    if (!row) {
      throw new Error('expected own row');
    }
    act(() => {
      result.current.setRequired(row, true);
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(true);
    });
    gate.release();
    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });
  });
});
