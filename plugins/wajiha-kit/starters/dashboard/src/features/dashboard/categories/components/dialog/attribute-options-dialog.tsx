import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DialogFormFullWidth,
  DialogFormGrid,
} from '@/components/dialog/dialog-form-grid';
import { DialogLayout } from '@/components/dialog/dialog-layout';
import { SwitchField } from '@/components/fields/switch-field';
import { TextField } from '@/components/fields/text-field';
import { DataBadge } from '@/components/table/data-badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { activeBadge } from '@/utils/status-tones';
import {
  diffOptions,
  hasOptionChanges,
  moveDraft,
  reorderDraft,
  toDrafts,
  type OptionChanges,
  type OptionDraft,
} from '../../utils/option-order';
import {
  attributeOptionSchema,
  defaultAttributeOptionForm,
  type AttributeOptionFormValues,
} from '../../validations/validations';

export interface AttributeOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: AttributeDefinitionResponse | null;
  isPending: boolean;
  /** Saves every change of the session together (11.02 "Save options"). */
  onSave: (changes: OptionChanges) => void;
}

type FormMode =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'edit'; key: string };

let draftCounter = 0;
function nextDraftKey(): string {
  draftCounter += 1;
  return `new-${draftCounter}`;
}

export function AttributeOptionsDialog({
  open,
  onOpenChange,
  attribute,
  isPending,
  onSave,
}: AttributeOptionsDialogProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<OptionDraft[]>([]);
  const [mode, setMode] = useState<FormMode>({ kind: 'closed' });

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
  const hasChanges = hasOptionChanges(changes);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    const row = event.currentTarget.closest<HTMLElement>('li');
    if (row) {
      event.dataTransfer.setDragImage(row, 0, 0);
    }
    setDragIndex(index);
  };

  const handleDrop = (event: DragEvent<HTMLElement>, index: number) => {
    if (dragIndex === null) {
      return;
    }
    event.preventDefault();
    const from = dragIndex;
    endDrag();
    setDrafts((current) => reorderDraft(current, from, index));
  };

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

  const handleSubmit = form.handleSubmit((values) => {
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
      setDrafts((current) => [
        ...current,
        { key: nextDraftKey(), id: null, code: '', ...next },
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

  return (
    <DialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={t('categories.options.title', { name: attribute?.name ?? '' })}
      description={t('categories.options.description')}
      size="md"
      footer={
        <>
          <Button
            type="button"
            disabled={!hasChanges || isPending}
            aria-busy={isPending}
            onClick={() => {
              onSave(changes);
            }}
          >
            {t('categories.options.save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t('common.cancel')}
          </Button>
        </>
      }
    >
      <div className="space-y-card">
        {drafts.length === 0 ? (
          <p className="text-b2 text-text-secondary">
            {t('categories.options.empty')}
          </p>
        ) : (
          <ol className="flex flex-col">
            {drafts.map((draft, index) => {
              const badge = activeBadge(draft.isActive);
              return (
                <li
                  key={draft.key}
                  onDragOver={(event) => {
                    if (dragIndex !== null) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                      setOverIndex(index);
                    }
                  }}
                  onDrop={(event) => {
                    handleDrop(event, index);
                  }}
                  className={cn(
                    'gap-inline py-field border-stroke flex items-center border-b transition-opacity',
                    dragIndex === index && 'opacity-50',
                    overIndex === index &&
                      dragIndex !== index &&
                      'border-primary-highlight',
                  )}
                >
                  <span
                    draggable={!isPending}
                    aria-hidden
                    onDragStart={(event) => {
                      handleDragStart(event, index);
                    }}
                    onDragEnd={endDrag}
                    className="text-text-muted hover:text-text-primary inline-flex size-6 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </span>
                  <span
                    className="text-b3 text-text-secondary w-6 shrink-0 text-center tabular-nums"
                    title={t('categories.options.order', {
                      number: index + 1,
                    })}
                  >
                    {index + 1}
                  </span>
                  <span className="text-b2 text-text-primary min-w-0 truncate">
                    {draft.label}
                  </span>
                  <span
                    dir="ltr"
                    className="text-b3 text-text-muted min-w-0 flex-1 truncate"
                  >
                    {draft.code}
                  </span>
                  <DataBadge tone={badge.tone} shape="pill">
                    {t(badge.labelKey)}
                  </DataBadge>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`${t('categories.options.moveUp')}: ${draft.label}`}
                    disabled={isPending || index === 0}
                    onClick={() => {
                      setDrafts((current) =>
                        moveDraft(current, draft.key, 'up'),
                      );
                    }}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`${t('categories.options.moveDown')}: ${draft.label}`}
                    disabled={isPending || index === drafts.length - 1}
                    onClick={() => {
                      setDrafts((current) =>
                        moveDraft(current, draft.key, 'down'),
                      );
                    }}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`${t('common.edit')}: ${draft.label}`}
                    disabled={isPending}
                    onClick={() => {
                      startEdit(draft);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`${t('common.delete')}: ${draft.label}`}
                    disabled={isPending}
                    onClick={() => {
                      removeDraft(draft.key);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ol>
        )}

        {mode.kind === 'closed' ? (
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={startAdd}
            >
              <Plus className="size-4" />
              {t('categories.options.add')}
            </Button>
          </div>
        ) : (
          <section className="space-y-row border-stroke pt-card border-t">
            <h3 className="text-h5">
              {mode.kind === 'edit'
                ? t('categories.options.formEditTitle')
                : t('categories.options.formCreateTitle')}
            </h3>
            <Form {...form}>
              <form
                noValidate
                onSubmit={(event) => {
                  event.stopPropagation();
                  void handleSubmit(event);
                }}
                className="space-y-row"
              >
                <DialogFormGrid>
                  <TextField
                    control={form.control}
                    placeholder={t('categories.options.labelPlaceholder')}
                    name="label"
                    label={t('categories.options.label')}
                    maxLength={100}
                    required
                  />
                  <DialogFormFullWidth>
                    <SwitchField
                      control={form.control}
                      name="isActive"
                      label={t('categories.form.isActive')}
                    />
                  </DialogFormFullWidth>
                </DialogFormGrid>
                <div className="gap-row flex justify-end">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    {t('categories.options.cancelForm')}
                  </Button>
                  <Button type="submit">
                    {mode.kind === 'edit'
                      ? t('categories.options.confirmEdit')
                      : t('categories.options.confirmAdd')}
                  </Button>
                </div>
              </form>
            </Form>
          </section>
        )}
      </div>
    </DialogLayout>
  );
}
