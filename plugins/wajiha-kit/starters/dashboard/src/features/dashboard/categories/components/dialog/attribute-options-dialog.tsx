import { useTranslation } from 'react-i18next';
import { DialogLayout } from '@/components/dialog/dialog-layout';
import { Button } from '@/components/ui/button';
import { Plus } from '@/lib/icons';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { useOptionDrafts } from '../../hooks/form/use-option-drafts';
import type { OptionChanges } from '../../utils/option-order';
import { OptionDraftList } from './option-draft-list';
import { OptionFormSection } from './option-form-section';

export interface AttributeOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: AttributeDefinitionResponse | null;
  isPending: boolean;
  /** Saves every change of the session together (11.02 "Save options"). */
  onSave: (changes: OptionChanges) => void;
}

export function AttributeOptionsDialog({
  open,
  onOpenChange,
  attribute,
  isPending,
  onSave,
}: AttributeOptionsDialogProps) {
  const { t } = useTranslation();
  const options = useOptionDrafts(open, attribute);
  const { mode } = options;

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
            disabled={!options.hasChanges || isPending}
            aria-busy={isPending}
            onClick={() => {
              onSave(options.changes);
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
        {options.drafts.length === 0 ? (
          <p className="text-b2 text-text-secondary">
            {t('categories.options.empty')}
          </p>
        ) : (
          <OptionDraftList
            drafts={options.drafts}
            isPending={isPending}
            onMove={options.move}
            onReorder={options.reorder}
            onEdit={options.startEdit}
            onRemove={options.removeDraft}
          />
        )}

        {mode.kind === 'closed' ? (
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={options.startAdd}
            >
              <Plus className="size-4" />
              {t('categories.options.add')}
            </Button>
          </div>
        ) : (
          <OptionFormSection
            mode={mode}
            form={options.form}
            onSubmit={options.submitForm}
            onCancel={options.closeForm}
          />
        )}
      </div>
    </DialogLayout>
  );
}
