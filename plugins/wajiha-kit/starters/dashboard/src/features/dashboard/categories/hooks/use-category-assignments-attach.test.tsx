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
  mockList,
  renderAssignments,
} from './use-category-assignments.fixtures';

const ASSIGNMENTS_PATH = api(endpoints.itemCategories.attributes('cat-hand'));
const OWN_ROW_PATH = api(
  endpoints.itemCategories.attribute('cat-hand', 'asg-2'),
);

describe('useCategoryAssignments attach and detach', () => {
  it('sends a DELETE when detaching an assignment', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:delete'] });
    mockList();
    const deleteSpy = vi.fn();
    const gate = createGate();
    server.use(
      http.delete(OWN_ROW_PATH, async () => {
        deleteSpy();
        await gate.promise;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    act(() => {
      result.current.detach('asg-2');
    });

    await waitFor(() => {
      expect(result.current.isDetaching).toBe(true);
    });
    gate.release();
    await waitFor(() => {
      expect(result.current.isDetaching).toBe(false);
    });
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('calls onSuccess after the POST attach succeeds', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    let body: unknown = null;
    const gate = createGate();
    server.use(
      http.post(ASSIGNMENTS_PATH, async ({ request }) => {
        body = await request.json();
        await gate.promise;
        return HttpResponse.json(ASSIGNMENTS[1], { status: 201 });
      }),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const onSuccess = vi.fn();
    const payload = {
      attributeDefinitionId: 'attr-color',
      isRequired: false,
      isVariantAxis: true,
      sortOrder: 2,
    };
    act(() => {
      result.current.attach(payload, onSuccess);
    });

    await waitFor(() => {
      expect(result.current.isAttaching).toBe(true);
    });
    gate.release();
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(result.current.isAttaching).toBe(false);
    expect(body).toEqual(payload);
  });
});
