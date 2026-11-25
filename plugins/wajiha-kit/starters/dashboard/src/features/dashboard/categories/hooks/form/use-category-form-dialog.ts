import { useState } from 'react';

export type CategoryFormMode = 'create' | 'edit' | 'move';

export function useCategoryFormDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CategoryFormMode>('create');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  return {
    open,
    mode,
    categoryId,
    openCreate: () => {
      setMode('create');
      setCategoryId(null);
      setOpen(true);
    },
    openEdit: (id: string) => {
      setMode('edit');
      setCategoryId(id);
      setOpen(true);
    },
    openMove: (id: string) => {
      setMode('move');
      setCategoryId(id);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
    onOpenChange: (next: boolean) => {
      setOpen(next);
      if (!next) {
        setCategoryId(null);
      }
    },
  };
}
