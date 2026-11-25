import type {
  AttributeOptionRequest,
  AttributeOptionResponse,
} from '@/types/api/catalog';

/** One row of the options dialog before "Save options" is pressed. */
export interface OptionDraft {
  /** Stable React key; the server id for stored options. */
  key: string;
  /** Server id, or null for an option added in this session. */
  id: string | null;
  code: string;
  label: string;
  isActive: boolean;
}

/** A stored option id, or the index of an option created in the same save. */
export type OrderSlot = string | number;

export interface OptionChanges {
  deletes: string[];
  updates: { id: string; payload: AttributeOptionRequest }[];
  creates: AttributeOptionRequest[];
  order: OrderSlot[] | null;
}

/** Stored options in display order (ties keep the list order). */
export function sortOptions(
  options: AttributeOptionResponse[],
): AttributeOptionResponse[] {
  return options
    .map((option, index) => ({ option, index }))
    .toSorted(
      (a, b) =>
        (a.option.sortOrder ?? 0) - (b.option.sortOrder ?? 0) ||
        a.index - b.index,
    )
    .map(({ option }) => option);
}

export function toDrafts(options: AttributeOptionResponse[]): OptionDraft[] {
  return sortOptions(options).map((option) => ({
    key: option.id,
    id: option.id,
    code: option.code ?? '',
    label: option.label ?? '',
    isActive: option.isActive ?? true,
  }));
}

/** Moves one draft a slot up or down; returns the same list at the edges. */
export function moveDraft(
  drafts: OptionDraft[],
  key: string,
  direction: 'up' | 'down',
): OptionDraft[] {
  const index = drafts.findIndex((draft) => draft.key === key);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= drafts.length) {
    return drafts;
  }
  const next = [...drafts];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Drops the draft at `from` into the slot of the draft at `to` (drag and drop). */
export function reorderDraft(
  drafts: OptionDraft[],
  from: number,
  to: number,
): OptionDraft[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= drafts.length ||
    to >= drafts.length
  ) {
    return drafts;
  }
  const next = [...drafts];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function sameOrder(left: OrderSlot[], right: OrderSlot[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

/**
 * What "Save options" has to send. Removed options are deleted, new ones
 * created (numbered after the highest stored sortOrder) and edited ones
 * updated; a moved option never costs its own request: when the final order
 * differs from stored order followed by the new options, `order` lists the
 * whole final order for the single reorder request.
 */
export function diffOptions(
  stored: AttributeOptionResponse[],
  drafts: OptionDraft[],
): OptionChanges {
  const storedById = new Map(stored.map((option) => [option.id, option]));
  const keptIds = new Set(drafts.map((draft) => draft.id));
  const keptStored = sortOptions(
    stored.filter((option) => keptIds.has(option.id)),
  ).map((option) => option.id);
  let nextOrder =
    Math.max(-1, ...stored.map((option) => option.sortOrder ?? 0)) + 1;

  const changes: OptionChanges = {
    deletes: stored
      .filter((option) => !keptIds.has(option.id))
      .map((option) => option.id),
    updates: [],
    creates: [],
    order: null,
  };
  const desired: OrderSlot[] = [];
  for (const draft of drafts) {
    const original = draft.id === null ? undefined : storedById.get(draft.id);
    if (draft.id === null || original === undefined) {
      desired.push(changes.creates.length);
      changes.creates.push({
        label: draft.label.trim(),
        sortOrder: nextOrder,
        isActive: draft.isActive,
      });
      nextOrder += 1;
      continue;
    }
    desired.push(draft.id);
    const label = draft.label.trim();
    if (
      (original.label ?? '') !== label ||
      (original.isActive ?? true) !== draft.isActive
    ) {
      changes.updates.push({
        id: draft.id,
        payload: {
          code: original.code ?? undefined,
          label,
          sortOrder: original.sortOrder ?? undefined,
          isActive: draft.isActive,
        },
      });
    }
  }
  const baseline: OrderSlot[] = [
    ...keptStored,
    ...changes.creates.map((_, index) => index),
  ];
  changes.order = sameOrder(desired, baseline) ? null : desired;
  return changes;
}

export function hasOptionChanges(changes: OptionChanges): boolean {
  return (
    changes.deletes.length > 0 ||
    changes.updates.length > 0 ||
    changes.creates.length > 0 ||
    changes.order !== null
  );
}
