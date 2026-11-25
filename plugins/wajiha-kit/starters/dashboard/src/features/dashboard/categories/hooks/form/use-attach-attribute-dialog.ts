import { useState } from 'react';

export function useAttachAttributeDialog() {
  const [open, setOpen] = useState(false);

  return {
    open,
    openAttach: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
    onOpenChange: (next: boolean) => {
      setOpen(next);
    },
  };
}

export type AttachAttributeDialogState = ReturnType<
  typeof useAttachAttributeDialog
>;
