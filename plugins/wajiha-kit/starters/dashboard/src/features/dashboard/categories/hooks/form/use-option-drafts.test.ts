import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { useOptionDrafts } from './use-option-drafts';

function definition(
  options: { id: string; label: string }[],
): AttributeDefinitionResponse {
  return {
    id: 'attr-1',
    code: 'COLOR',
    name: 'Color',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: options.map((option, index) => ({
      ...option,
      code: option.id,
      sortOrder: index + 1,
      isActive: true,
    })),
  };
}

async function addOption(
  result: { current: ReturnType<typeof useOptionDrafts> },
  label: string,
) {
  act(() => {
    result.current.startAdd();
  });
  act(() => {
    result.current.form.setValue('label', label);
  });
  await act(async () => {
    await result.current.submitForm();
  });
}

describe('useOptionDrafts after a save that failed half way', () => {
  it('keeps the option the server already created instead of deleting it', async () => {
    const { result, rerender } = renderHook(
      ({ attribute }) => useOptionDrafts(true, attribute),
      { initialProps: { attribute: definition([]) } },
    );
    await addOption(result, 'Red');
    await addOption(result, 'Blue');
    expect(result.current.changes.creates).toHaveLength(2);

    // The first create went through, the second failed; the list refetched.
    rerender({ attribute: definition([{ id: 'opt-red', label: 'Red' }]) });

    expect(result.current.changes.deletes).toEqual([]);
    expect(result.current.changes.creates.map((c) => c.label)).toEqual([
      'Blue',
    ]);
    expect(result.current.drafts.map((draft) => draft.id)).toEqual([
      'opt-red',
      null,
    ]);
  });

  it('still wipes nothing when the refetch brings no new option', async () => {
    const { result, rerender } = renderHook(
      ({ attribute }) => useOptionDrafts(true, attribute),
      { initialProps: { attribute: definition([]) } },
    );
    await addOption(result, 'Red');

    rerender({ attribute: definition([]) });

    expect(result.current.drafts).toHaveLength(1);
    expect(result.current.changes.creates).toHaveLength(1);
  });
});
