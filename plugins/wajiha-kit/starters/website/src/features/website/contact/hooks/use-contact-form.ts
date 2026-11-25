import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSingleFlight } from '@/shared/utils/single-flight';
import { contactSchema, EMPTY_CONTACT, type ContactInput } from '../validations/contact-schema';

export type ContactStatus = 'idle' | 'sent' | 'failed';

type Submit = (input: ContactInput) => Promise<{ ok: boolean }>;

export function useContactForm(submit: Submit) {
  const [status, setStatus] = useState<ContactStatus>('idle');
  // Single flight: a second tap while a request is running does nothing.
  const [singleFlight] = useState(createSingleFlight);
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_CONTACT,
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit((values) =>
    singleFlight(async () => {
      try {
        const result = await submit(values);
        setStatus(result.ok ? 'sent' : 'failed');
        if (result.ok) {
          form.reset(EMPTY_CONTACT);
        }
      } catch {
        setStatus('failed');
      }
    }).then(() => undefined),
  );

  const reset = () => setStatus('idle');

  return { form, status, onSubmit, reset };
}
