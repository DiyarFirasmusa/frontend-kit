import { useCallback, useState } from 'react';

/**
 * Which row a list page is about to delete, and whether its confirm dialog is
 * open. The row is kept after the dialog closes so its text stays stable while
 * the dialog animates out. One hook for every list page, so the names
 * (deleteTarget, isDeleteOpen, openDelete, closeDelete) are the same everywhere.
 */
export function useDeleteTarget<T>() {
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDelete = useCallback((row: T) => {
    setDeleteTarget(row);
    setIsOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    deleteTarget,
    isDeleteOpen: isOpen && deleteTarget !== null,
    openDelete,
    closeDelete,
  };
}
