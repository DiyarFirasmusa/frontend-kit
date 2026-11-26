import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { GlobalSearch } from './global-search';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Global search for widths where the top bar has no room for the field: an
 * icon button that opens the same combobox in a dialog. Ctrl/Cmd+K opens it
 * too (the top bar owns the shortcut).
 */
export function SearchDialog({
  open,
  onOpenChange,
  className,
}: SearchDialogProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        data-slot="search-trigger"
        aria-label={t('search.open')}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          className,
        )}
      >
        <Search aria-hidden className="size-5" />
      </DialogTrigger>
      <DialogContent
        size="md"
        className="top-16 translate-y-0 overflow-visible p-4 pt-14"
      >
        <DialogTitle className="text-h5 absolute start-4 top-4 leading-8">
          {t('search.label')}
        </DialogTitle>
        <GlobalSearch
          variant="dialog"
          onSelected={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
