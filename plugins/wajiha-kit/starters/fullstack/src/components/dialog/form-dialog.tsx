import { useId, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogLayout,
  type DialogIconLayout,
  type DialogIconTone,
} from '@/components/dialog/dialog-layout';
import { Button } from '@/components/ui/button';
import { Loader2 } from '@/components/ui/icons';

type DialogSize = NonNullable<ComponentProps<typeof DialogLayout>['size']>;
type SubmitVariant = ComponentProps<typeof Button>['variant'];

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  iconTone?: DialogIconTone;
  iconLayout?: DialogIconLayout;
  size?: DialogSize;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  canSubmit: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitVariant?: SubmitVariant;
  footerExtra?: ReactNode;
  formId?: string;
  children: ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconTone,
  iconLayout,
  size = 'md',
  onSubmit,
  isPending,
  canSubmit,
  submitLabel,
  cancelLabel,
  submitVariant = 'default',
  footerExtra,
  formId,
  children,
}: FormDialogProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const resolvedFormId = formId ?? generatedId;

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
      title={title}
      description={description}
      icon={icon}
      iconTone={iconTone}
      iconLayout={iconLayout}
      size={size}
      showCloseButton={false}
      footer={
        <>
          <Button
            type="submit"
            form={resolvedFormId}
            variant={submitVariant}
            disabled={!canSubmit || isPending}
            aria-busy={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel ?? t('ui.save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            {cancelLabel ?? t('ui.cancel')}
          </Button>
          {footerExtra}
        </>
      }
    >
      <form
        id={resolvedFormId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit || isPending) {
            return;
          }
          onSubmit(event);
        }}
      >
        {children}
      </form>
    </DialogLayout>
  );
}
