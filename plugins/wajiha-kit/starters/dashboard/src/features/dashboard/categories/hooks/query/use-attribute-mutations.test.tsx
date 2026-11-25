import { act } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { qk } from '@/constants/query-keys';
import { signIn } from '@/test/fixtures/auth';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders } from '@/test/render';
import { useSaveAttributeOptions } from './use-attribute-mutations';

const definitionId = 'attr-color';

type Seen = { current?: ReturnType<typeof useSaveAttributeOptions> };

function SaveOptionsProbe({ seen }: { seen: Seen }) {
  seen.current = useSaveAttributeOptions();
  return null;
}

describe('attribute option mutations', () => {
  it('useSaveAttributeOptions sends deletes, updates and creates in order and invalidates', async () => {
    signIn({ permissions: [PERMS.attributeDefinition.write] });
    const calls: string[] = [];
    server.use(
      http.delete(
        api(endpoints.attributeDefinitions.option(definitionId, 'o-old')),
        () => {
          calls.push('delete o-old');
          return new HttpResponse(null, { status: 204 });
        },
      ),
      http.put(
        api(endpoints.attributeDefinitions.option(definitionId, 'o-1')),
        () => {
          calls.push('update o-1');
          return HttpResponse.json({ id: 'o-1' });
        },
      ),
      http.post(
        api(endpoints.attributeDefinitions.options(definitionId)),
        () => {
          calls.push('create');
          return HttpResponse.json({ id: 'o-new' }, { status: 201 });
        },
      ),
    );
    const seen: Seen = {};
    const { queryClient } = renderWithProviders(
      <SaveOptionsProbe seen={seen} />,
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await seen.current?.mutateAsync({
        definitionId,
        changes: {
          deletes: ['o-old'],
          updates: [
            {
              id: 'o-1',
              payload: { label: 'A', sortOrder: 0 },
            },
          ],
          creates: [{ label: 'Red', sortOrder: 1 }],
          order: null,
        },
      });
    });

    expect(calls).toEqual(['delete o-old', 'update o-1', 'create']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.attributes.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.categories.all });
  });

  it('invalidates even when a request of the batch fails', async () => {
    signIn({ permissions: [PERMS.attributeDefinition.write] });
    server.use(
      http.post(api(endpoints.attributeDefinitions.options(definitionId)), () =>
        HttpResponse.json({ message: 'duplicate' }, { status: 409 }),
      ),
    );
    const seen: Seen = {};
    const { queryClient } = renderWithProviders(
      <SaveOptionsProbe seen={seen} />,
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await seen.current
        ?.mutateAsync({
          definitionId,
          changes: {
            deletes: [],
            updates: [],
            creates: [{ label: 'Red', sortOrder: 0 }],
            order: null,
          },
        })
        .catch(() => null);
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.attributes.all });
  });
});
