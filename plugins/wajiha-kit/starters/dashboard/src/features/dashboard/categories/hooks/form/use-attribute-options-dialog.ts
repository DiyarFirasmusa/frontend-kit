import { useState } from 'react';

export function useAttributeOptionsDialog() {
  const [open, setOpen] = useState(false);
  const [attributeId, setAttributeId] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setAttributeId(null);
  };

  return {
    open,
    attributeId,
    openFor: (id: string) => {
      setAttributeId(id);
      setOpen(true);
    },
    close,
    onOpenChange: (next: boolean) => {
      if (!next) {
        close();
        return;
      }
      setOpen(true);
    },
  };
}
