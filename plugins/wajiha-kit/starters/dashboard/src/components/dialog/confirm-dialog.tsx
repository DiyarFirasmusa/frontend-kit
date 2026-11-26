import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  /**
   * Runs once per request. Return the request's promise to keep the dialog
   * busy until it settles; `isLoading` does the same for callers that track
   * the request themselves.
   */
  onConfirm: () => void | Promise<unknown>;
  isLoading?: boolean;
  destructive?: boolean;
}

/**
 * Asks before an action. A destructive one is an alert dialog (it interrupts
 * and must be answered) with focus on Cancel, so Enter right after opening
 * never deletes. While the request runs, the confirm button ignores further
 * presses and the dialog cannot be dismissed; the caller closes it when the
 * request settles.
 */
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
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const [awaiting, setAwaiting] = useState(false);
  const pending = Boolean(isLoading) || awaiting;

  // The guard drops when the dialog closes or when the caller's request,
  // reported through isLoading, has finished (so a failed request can be
  // retried from the same dialog).
  const wasLoading = useRef(false);
  useEffect(() => {
    if (!open || (wasLoading.current && !isLoading)) {
      inFlight.current = false;
    }
    wasLoading.current = Boolean(isLoading);
  }, [open, isLoading]);

  const handleOpenChange = (next: boolean) => {
    if (!next && pending) {
      return;
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (inFlight.current || pending) {
      return;
    }
    inFlight.current = true;
    const result = onConfirm();
    if (result instanceof Promise) {
      setAwaiting(true);
      void result
        .catch(() => null)
        .finally(() => {
          inFlight.current = false;
          setAwaiting(false);
        });
    }
  };

  const content = (
    <DialogContent
      size="sm"
      showCloseButton={false}
      initialFocus={destructive ? cancelRef : true}
    >
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
          onClick={handleConfirm}
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {confirmLabel ?? t('common.confirm')}
        </Button>
        <Button
          ref={cancelRef}
          variant="outline"
          onClick={() => {
            handleOpenChange(false);
          }}
          disabled={pending}
        >
          {cancelLabel ?? t('common.cancel')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (destructive) {
    return (
      <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        {content}
      </AlertDialogPrimitive.Root>
    );
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {content}
    </Dialog>
  );
}
