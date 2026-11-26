import { describe, expect, it } from 'vitest';
import type { AttributeOptionResponse } from '@/types/api/catalog';
import {
  adoptCreatedOptions,
  diffOptions,
  hasOptionChanges,
  moveDraft,
  reorderDraft,
  toDrafts,
  type OptionDraft,
} from './option-order';

function stored(
  id: string,
  sortOrder: number,
  overrides: Partial<AttributeOptionResponse> = {},
): AttributeOptionResponse {
  return {
    id,
    code: id,
    label: id.toUpperCase(),
    sortOrder,
    isActive: true,
    ...overrides,
  };
}

const STORED = [stored('b', 2), stored('a', 1), stored('c', 3)];

describe('option-order', () => {
  it('builds drafts in sortOrder', () => {
    expect(toDrafts(STORED).map((draft) => draft.id)).toEqual(['a', 'b', 'c']);
  });

  it('moves a draft and keeps the edges in place', () => {
    const drafts = toDrafts(STORED);
    expect(moveDraft(drafts, 'b', 'up').map((d) => d.key)).toEqual([
      'b',
      'a',
      'c',
    ]);
    expect(moveDraft(drafts, 'a', 'up')).toBe(drafts);
    expect(moveDraft(drafts, 'c', 'down')).toBe(drafts);
  });

  it('reports no change for untouched drafts, whatever their stored sortOrder', () => {
    expect(hasOptionChanges(diffOptions(STORED, toDrafts(STORED)))).toBe(false);
  });

  it('numbers new options after the highest stored sortOrder while the order is unchanged', () => {
    const drafts: OptionDraft[] = [
      ...toDrafts(STORED),
      { key: 'n1', id: null, code: '', label: 'Red', isActive: true },
      { key: 'n2', id: null, code: '', label: 'Tan', isActive: true },
    ];

    const changes = diffOptions(STORED, drafts);

    expect(changes.updates).toEqual([]);
    expect(changes.creates.map((option) => option.sortOrder)).toEqual([4, 5]);
  });

  it('reports no change for untouched drafts with matching positions', () => {
    const aligned = [stored('a', 0), stored('b', 1)];
    expect(hasOptionChanges(diffOptions(aligned, toDrafts(aligned)))).toBe(
      false,
    );
  });

  it('asks for one reorder when options moved, with edits, new and removed options alongside', () => {
    const aligned = [stored('a', 0), stored('b', 1), stored('c', 2)];
    const drafts: OptionDraft[] = [
      ...moveDraft(toDrafts(aligned), 'b', 'up').filter((d) => d.key !== 'c'),
      {
        key: 'new-1',
        id: null,
        code: '',
        label: ' Red ',
        isActive: false,
      },
    ];
    drafts[1] = { ...drafts[1], label: 'Alpha' };

    const changes = diffOptions(aligned, drafts);

    expect(changes.deletes).toEqual(['c']);
    expect(changes.updates).toEqual([
      {
        id: 'a',
        payload: { code: 'a', label: 'Alpha', sortOrder: 0, isActive: true },
      },
    ]);
    expect(changes.creates).toEqual([
      { label: 'Red', sortOrder: 3, isActive: false },
    ]);
    expect(changes.order).toEqual(['b', 'a', 0]);
  });

  it('needs no reorder request when options keep their order', () => {
    expect(diffOptions(STORED, toDrafts(STORED)).order).toBeNull();
  });

  it('reorders a draft by drag position', () => {
    const drafts = toDrafts(STORED);
    expect(reorderDraft(drafts, 0, 2).map((d) => d.key)).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(reorderDraft(drafts, 1, 1)).toBe(drafts);
  });
});

const draft = (key: string, label: string): OptionDraft => ({
  key,
  id: null,
  code: '',
  label,
  isActive: true,
});

describe('adoptCreatedOptions', () => {
  it('gives a new draft the id of the option the failed save created', () => {
    const drafts = [draft('new-1', 'Red'), draft('new-2', 'Blue')];
    const fresh = [stored('opt-red', 1, { label: 'Red' })];

    const adopted = adoptCreatedOptions(drafts, fresh);

    expect(adopted.map((item) => item.id)).toEqual(['opt-red', null]);
    expect(adopted[0]?.key).toBe('new-1');
  });

  it('turns the retry into one create instead of a delete and two creates', () => {
    const afterFailure = [stored('opt-red', 1, { label: 'Red' })];
    const adopted = adoptCreatedOptions(
      [draft('new-1', 'Red'), draft('new-2', 'Blue')],
      afterFailure,
    );

    const changes = diffOptions(afterFailure, adopted);

    expect(changes.deletes).toEqual([]);
    expect(changes.updates).toEqual([]);
    expect(changes.creates.map((create) => create.label)).toEqual(['Blue']);
  });

  it('never gives one stored option to two drafts', () => {
    const drafts = [draft('new-1', 'Red'), draft('new-2', 'Red')];
    const adopted = adoptCreatedOptions(drafts, [
      stored('opt-red', 1, { label: 'Red' }),
    ]);
    expect(adopted.map((item) => item.id)).toEqual(['opt-red', null]);
  });
});
