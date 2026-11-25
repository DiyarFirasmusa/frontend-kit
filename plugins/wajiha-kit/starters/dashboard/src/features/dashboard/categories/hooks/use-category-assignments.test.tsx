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
  mockList,
  renderAssignments,
} from './use-category-assignments.fixtures';

describe('useCategoryAssignments rows', () => {
  it('maps rows with the source category name', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    const { result } = renderAssignments();

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });
    expect(result.current.rows[0]?.sourceName).toBe('Safety');
    expect(result.current.rows[1]?.sourceName).toBe('Hand protection');
  });

  it('does not send a PUT for inherited rows even when other rows are written', async () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    mockList();
    const inheritedPutSpy = vi.fn();
    const ownPutSpy = vi.fn();
    server.use(
      http.put(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-1')),
        () => {
          inheritedPutSpy();
          return HttpResponse.json(ASSIGNMENTS[0]);
        },
      ),
      http.put(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-2')),
        () => {
          ownPutSpy();
          return HttpResponse.json(ASSIGNMENTS[1]);
        },
      ),
    );
    const { result } = renderAssignments();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });

    const inherited = result.current.rows[0];
    const own = result.current.rows[1];
    if (!inherited || !own) {
      throw new Error('expected both rows');
    }
    act(() => {
      result.current.setRequired(inherited, false);
      result.current.setVariantAxis(inherited, true);
      result.current.setRequired(own, true);
    });

    await waitFor(() => {
      expect(ownPutSpy).toHaveBeenCalledTimes(1);
    });
    expect(inheritedPutSpy).not.toHaveBeenCalled();
  });

  it('returns no rows and sends no request when no category is selected', () => {
    signIn({ permissions: ['item_category:read', 'item_category:write'] });
    const listSpy = vi.fn();
    server.use(
      http.get(api(endpoints.itemCategories.attributes('cat-hand')), () => {
        listSpy();
        return HttpResponse.json(ASSIGNMENTS);
      }),
    );
    const { result } = renderAssignments(null);

    expect(result.current.rows).toEqual([]);
    expect(result.current.query.fetchStatus).toBe('idle');
    expect(listSpy).not.toHaveBeenCalled();
  });
});
