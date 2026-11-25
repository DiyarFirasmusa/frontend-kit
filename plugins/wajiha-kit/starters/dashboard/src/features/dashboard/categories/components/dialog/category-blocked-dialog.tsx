import { useTranslation } from 'react-i18next';
import { DialogLayout } from '@/components/dialog/dialog-layout';
import { Button } from '@/components/ui/button';
import { Bell, Bookmark, Loader2 } from '@/lib/icons';
import { formatPlainNumber } from '@/utils/format';

export interface CategoryBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  categoryPath: string;
  /** Items linked to the category, from `itemCount`; null when unknown. */
  itemCount: number | null;
  /** Direct child categories, from `childCount`; null when unknown. */
  childCount: number | null;
  isActive: boolean;
  canDeactivate: boolean;
  isPending: boolean;
  onDeactivate: () => void;
}

export function CategoryBlockedDialog({
  open,
  onOpenChange,
  categoryName,
  categoryPath,
  itemCount,
  childCount,
  isActive,
  canDeactivate,
  isPending,
  onDeactivate,
}: CategoryBlockedDialogProps) {
  const { t } = useTranslation();

  const childrenLabel =
    childCount === null
      ? '—'
      : t(
          childCount > 0
            ? 'categories.blocked.present'
            : 'categories.blocked.none',
        );

  const handleOpenChange = (next: boolean) => {
    if (!next && isPending) {
      return;
    }
    onOpenChange(next);
  };

  return (
    <DialogLayout
      open={open}
      onOpenChange={handleOpenChange}
      title={t('categories.blocked.title')}
      description={t('categories.blocked.description')}
      icon={<Bookmark className="size-5" />}
      size="md"
      footer={
        <>
          {canDeactivate ? (
            <Button type="button" disabled={isPending} onClick={onDeactivate}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('categories.blocked.deactivate')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            {t('common.close')}
          </Button>
        </>
      }
    >
      <div className="space-y-card">
        <div className="gap-row grid grid-cols-1 sm:grid-cols-2">
          <ReadBox
            label={t('categories.blocked.category')}
            value={categoryName}
          />
          <ReadBox
            label={t('categories.detail.path')}
            value={categoryPath || '—'}
          />
          <ReadBox
            label={t('categories.blocked.linkedItems')}
            value={formatPlainNumber(itemCount)}
          />
          <ReadBox
            label={t('categories.blocked.childCategories')}
            value={childrenLabel}
          />
          <ReadBox
            label={t('categories.blocked.rejectReason')}
            value={t('categories.blocked.reason')}
          />
          <ReadBox
            label={t('categories.blocked.suggestion')}
            value={t('categories.blocked.hint')}
          />
        </div>
        <div className="gap-field flex flex-col">
          <p className="text-h5 text-danger gap-field flex items-center">
            <Bell className="size-4 shrink-0" aria-hidden />
            {t('categories.blocked.whyTitle')}
          </p>
          <p className="text-b2 text-text-secondary">
            {t('categories.blocked.whyBody')}
          </p>
        </div>
        <dl className="gap-field grid grid-cols-3">
          <BlockedStat
            label={t('categories.blocked.items')}
            value={formatPlainNumber(itemCount)}
          />
          <BlockedStat
            label={t('categories.blocked.children')}
            value={childrenLabel}
          />
          <BlockedStat
            label={t('categories.blocked.status')}
            value={t(isActive ? 'common.active' : 'common.inactive')}
          />
        </dl>
      </div>
    </DialogLayout>
  );
}

function ReadBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="gap-field flex min-w-0 flex-col">
      <span className="text-label text-text-secondary">{label}</span>
      <div className="border-stroke-strong bg-surface-dim text-b2 text-text-primary px-row flex min-h-[42px] items-center rounded-(--radius-control) border">
        <span className="min-w-0 truncate">{value}</span>
      </div>
    </div>
  );
}

function BlockedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-hover-row p-row flex flex-col items-center gap-1 rounded-xl text-center">
      <dt className="text-b3 text-text-secondary">{label}</dt>
      <dd className="text-h4 text-text-primary tabular-nums">{value}</dd>
    </div>
  );
}
