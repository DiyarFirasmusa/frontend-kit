import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogHeading,
  type DialogIconLayout,
  type DialogIconTone,
} from '@/components/dialog/dialog-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from '@/lib/icons';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Optional bare glyph beside or above the title (frames 03.02, 03.03). */
  icon?: ReactNode;
  iconTone?: DialogIconTone;
  iconLayout?: DialogIconLayout;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconTone,
  iconLayout,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isLoading,
  destructive,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const handleOpenChange = (next: boolean) => {
    if (!next && isLoading) {
      return;
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm" showCloseButton={false}>
        <DialogHeading
          title={title}
          description={description}
          icon={icon}
          iconTone={iconTone ?? (destructive ? 'danger' : 'success')}
          iconLayout={iconLayout}
        />
        <DialogFooter>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel ?? t('common.confirm')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
            }}
            disabled={isLoading}
          >
            {cancelLabel ?? t('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
