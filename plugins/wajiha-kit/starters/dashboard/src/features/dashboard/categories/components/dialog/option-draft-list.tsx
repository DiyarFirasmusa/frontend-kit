import { useTranslation } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Trash2,
} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { activeBadge } from '@/utils/status-tones';
import { useOptionDrag } from '../../hooks/form/use-option-drag';
import type { OptionDraft } from '../../utils/option-order';

interface OptionDraftListProps {
  drafts: OptionDraft[];
  /** Every control is off while the options are being saved. */
  isPending: boolean;
  onMove: (key: string, direction: 'up' | 'down') => void;
  onReorder: (from: number, to: number) => void;
  onEdit: (draft: OptionDraft) => void;
  onRemove: (key: string) => void;
}

/** The options of an attribute in order: drag, move, edit and remove each. */
export function OptionDraftList({
  drafts,
  isPending,
  onMove,
  onReorder,
  onEdit,
  onRemove,
}: OptionDraftListProps) {
  const { t } = useTranslation();
  const drag = useOptionDrag(onReorder);

  return (
    <ol className="flex flex-col">
      {drafts.map((draft, index) => {
        const badge = activeBadge(draft.isActive);
        return (
          <li
            key={draft.key}
            onDragOver={(event) => {
              drag.onDragOver(event, index);
            }}
            onDrop={(event) => {
              drag.onDrop(event, index);
            }}
            className={cn(
              'gap-inline py-field border-stroke flex items-center border-b transition-opacity',
              drag.dragIndex === index && 'opacity-50',
              drag.overIndex === index &&
                drag.dragIndex !== index &&
                'border-primary-highlight',
            )}
          >
            <span
              draggable={!isPending}
              aria-hidden
              onDragStart={(event) => {
                drag.onDragStart(event, index);
              }}
              onDragEnd={drag.endDrag}
              className="text-text-muted hover:text-text-primary inline-flex size-6 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </span>
            <span
              className="text-b3 text-text-secondary w-6 shrink-0 text-center tabular-nums"
              title={t('categories.options.order', { number: index + 1 })}
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
                onMove(draft.key, 'up');
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
                onMove(draft.key, 'down');
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
                onEdit(draft);
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
                onRemove(draft.key);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        );
      })}
    </ol>
  );
}
