import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useSingleFlight } from '@/hooks/use-single-flight';

/** The part of a delete mutation the dialog needs (`useMutation`'s result fits). */
interface DeleteMutation {
  isPending: boolean;
  mutate: (
    id: string,
    options?: { onSuccess?: () => void; onSettled?: () => void },
  ) => void;
}

/**
 * The delete-confirm flow of a list page: which row, the dialog's props, and a
 * single-flight confirm (the button is disabled while pending; this guard also
 * covers Enter). Spread `dialog` onto `<ConfirmDialog>`.
 */
export function useDeleteDialog<T extends { id: string }>(
  remove: DeleteMutation,
  getName: (row: T) => string,
) {
  const { deleteTarget, isDeleteOpen, openDelete, closeDelete } =
    useDeleteTarget<T>();
  const flight = useSingleFlight();

  return {
    openDelete,
    dialog: {
      open: isDeleteOpen,
      name: deleteTarget ? getName(deleteTarget) : '',
      isLoading: remove.isPending,
      onOpenChange: (open: boolean) => {
        if (!open && !remove.isPending) {
          closeDelete();
        }
      },
      onConfirm: () => {
        if (!deleteTarget || !flight.start()) {
          return;
        }
        remove.mutate(deleteTarget.id, {
          onSuccess: closeDelete,
          onSettled: flight.end,
        });
      },
    },
  };
}
