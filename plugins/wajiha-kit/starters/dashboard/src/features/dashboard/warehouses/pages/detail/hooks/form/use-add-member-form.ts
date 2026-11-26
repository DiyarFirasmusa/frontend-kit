import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import {
  addMemberSchema,
  defaultAddMemberForm,
  toAddMemberPayload,
  type AddMemberValues,
} from '../../validations/validations';
import { useAddWarehouseMember } from '../query/use-warehouse-members';

export function useAddMemberForm(warehouseId: string) {
  const [open, setOpen] = useState(false);
  const add = useAddWarehouseMember(warehouseId);
  const flight = useSingleFlight();

  const form = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: defaultAddMemberForm,
    mode: 'onChange',
  });

  const close = () => {
    setOpen(false);
    form.reset(defaultAddMemberForm);
  };

  return {
    form,
    open,
    isPending: add.isPending,
    canSubmit: form.formState.isValid && !add.isPending,
    openAdd: () => {
      form.reset(defaultAddMemberForm);
      setOpen(true);
    },
    onOpenChange: (next: boolean) => {
      if (!next) {
        close();
        return;
      }
      setOpen(next);
    },
    onSubmit: form.handleSubmit((values) => {
      // Enter or a double click sends once: the ref flips before `isPending`.
      if (!flight.start()) {
        return;
      }
      add.mutate(toAddMemberPayload(values), {
        onSuccess: close,
        onSettled: flight.end,
      });
    }),
  };
}

export type AddMemberFormState = ReturnType<typeof useAddMemberForm>;
