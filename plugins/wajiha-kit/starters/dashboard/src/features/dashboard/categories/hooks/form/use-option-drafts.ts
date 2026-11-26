import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import {
  diffOptions,
  hasOptionChanges,
  moveDraft,
  reorderDraft,
  toDrafts,
  type OptionDraft,
} from '../../utils/option-order';
import {
  attributeOptionSchema,
  defaultAttributeOptionForm,
  type AttributeOptionFormValues,
} from '../../validations/validations';

export type OptionFormMode =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'edit'; key: string };

/**
 * The working copy of an attribute's options while its dialog is open: the
 * drafts, the add/edit form, and the diff against what is stored. Nothing is
 * sent until the dialog saves `changes`.
 */
export function useOptionDrafts(
  open: boolean,
  attribute: AttributeDefinitionResponse | null,
) {
  const [drafts, setDrafts] = useState<OptionDraft[]>([]);
  const [mode, setMode] = useState<OptionFormMode>({ kind: 'closed' });
  // Keys of options that are not saved yet; unique within this dialog.
  const draftCounter = useRef(0);

  const form = useForm<AttributeOptionFormValues>({
    resolver: zodResolver(attributeOptionSchema),
    defaultValues: defaultAttributeOptionForm,
  });

  // The draft starts from the stored options each time the dialog opens for an
  // attribute; later refetches (e.g. after a failed save) do not wipe it.
  const initializedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      initializedFor.current = null;
      return;
    }
    if (attribute && initializedFor.current !== attribute.id) {
      initializedFor.current = attribute.id;
      setDrafts(toDrafts(attribute.options ?? []));
      setMode({ kind: 'closed' });
      form.reset(defaultAttributeOptionForm);
    }
  }, [open, attribute, form]);

  const stored = useMemo(() => attribute?.options ?? [], [attribute]);
  const changes = useMemo(() => diffOptions(stored, drafts), [stored, drafts]);

  const closeForm = () => {
    setMode({ kind: 'closed' });
    form.reset(defaultAttributeOptionForm);
  };

  const startAdd = () => {
    form.reset(defaultAttributeOptionForm);
    setMode({ kind: 'add' });
  };

  const startEdit = (draft: OptionDraft) => {
    form.reset({
      label: draft.label,
      sortOrder: 0,
      isActive: draft.isActive,
    });
    setMode({ kind: 'edit', key: draft.key });
  };

  const submitForm = form.handleSubmit((values) => {
    const next = {
      label: values.label.trim(),
      isActive: values.isActive,
    };
    if (mode.kind === 'edit') {
      setDrafts((current) =>
        current.map((draft) =>
          draft.key === mode.key ? { ...draft, ...next } : draft,
        ),
      );
    } else {
      draftCounter.current += 1;
      const key = `new-${draftCounter.current}`;
      setDrafts((current) => [
        ...current,
        { key, id: null, code: '', ...next },
      ]);
    }
    closeForm();
  });

  const removeDraft = (key: string) => {
    setDrafts((current) => current.filter((draft) => draft.key !== key));
    if (mode.kind === 'edit' && mode.key === key) {
      closeForm();
    }
  };

  return {
    drafts,
    mode,
    form,
    changes,
    hasChanges: hasOptionChanges(changes),
    startAdd,
    startEdit,
    closeForm,
    submitForm,
    removeDraft,
    move: (key: string, direction: 'up' | 'down') => {
      setDrafts((current) => moveDraft(current, key, direction));
    },
    reorder: (from: number, to: number) => {
      setDrafts((current) => reorderDraft(current, from, to));
    },
  };
}
