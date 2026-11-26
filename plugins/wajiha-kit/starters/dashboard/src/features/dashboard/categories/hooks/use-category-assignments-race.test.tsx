import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { signIn } from '@/test/fixtures/auth';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  ASSIGNMENTS,
  createGate,
  renderAssignments,
} from './use-category-assignments.fixtures';

const LIST = api(endpoints.itemCategories.attributes('cat-hand'));
const OWN_PUT = api(endpoints.itemCategories.attribute('cat-hand', 'asg-2'));
const PERMS = [
  'item_category:read',
  'item_category:create',
  'item_category:update',
];

describe('useCategoryAssignments race and in-flight handling', () => {
  it('keeps the pending flags until the refreshed list lands', async () => {
    signIn({ permissions: PERMS });
    let listCalls = 0;
    const refetchGate = createGate();
    server.use(
      http.get(LIST, async () => {
        listCalls += 1;
        if (listCalls > 1) {
          await refetchGate.promise;
        }
        return HttpResponse.json(ASSIGNMENTS);
      }),
    );
    const bodies: unknown[] = [];
    server.use(
      http.put(OWN_PUT, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ ...ASSIGNMENTS[1], isRequired: true });
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const staleRow = result.current.rows[1];
    if (!staleRow) {
      throw new Error('expected own row');
    }
    act(() => {
      result.current.setRequired(staleRow, true);
    });
    await waitFor(() => {
      expect(listCalls).toBeGreaterThan(1);
    });

    act(() => {
      result.current.setVariantAxis(staleRow, false);
    });

    await waitFor(() => {
      expect(bodies).toHaveLength(2);
    });
    expect(bodies[1]).toEqual({
      attributeDefinitionId: 'attr-color',
      isRequired: true,
      isVariantAxis: false,
      sortOrder: 2,
    });
    refetchGate.release();
    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });
  });

  it('stays updating until the second of two overlapping PUTs and the first both settle', async () => {
    signIn({ permissions: PERMS });
    let listCalls = 0;
    server.use(
      http.get(LIST, () => {
        listCalls += 1;
        return HttpResponse.json(ASSIGNMENTS);
      }),
    );
    const gateA = createGate();
    const gateB = createGate();
    let putCalls = 0;
    server.use(
      http.put(OWN_PUT, async () => {
        putCalls += 1;
        const gate = putCalls === 1 ? gateA : gateB;
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
      result.current.setVariantAxis(row, false);
    });
    await waitFor(() => {
      expect(putCalls).toBe(2);
    });

    const listBeforeSecondSettle = listCalls;
    gateB.release();
    await waitFor(() => {
      expect(listCalls).toBeGreaterThan(listBeforeSecondSettle);
    });
    expect(result.current.isUpdating).toBe(true);

    gateA.release();
    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });
  });

  it('sends no PUT for a row without an attribute definition', async () => {
    signIn({ permissions: PERMS });
    server.use(
      http.get(LIST, () =>
        HttpResponse.json([{ ...ASSIGNMENTS[1], attributeDefinitionId: null }]),
      ),
    );
    const putSpy = vi.fn();
    server.use(
      http.put(OWN_PUT, () => {
        putSpy();
        return HttpResponse.json(ASSIGNMENTS[1]);
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(1);
    });

    const row = result.current.rows[0];
    if (!row) {
      throw new Error('expected own row');
    }
    act(() => {
      result.current.setRequired(row, true);
    });

    expect(result.current.isUpdating).toBe(false);
    expect(putSpy).not.toHaveBeenCalled();
  });
});
