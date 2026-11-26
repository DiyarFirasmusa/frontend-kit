import {
  useFormContext,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';

/**
 * Returns a callback that validates one field right away. Fields that declare
 * constraints call it on every change so a wrong value shows its error message
 * immediately instead of being silently dropped or waiting for submit.
 */
export function useLiveValidation(name: string, enabled: boolean) {
  // Outside a <Form> the context is null at runtime, whatever the typing says.
  const form: UseFormReturn<FieldValues> | null = useFormContext();

  return () => {
    if (enabled && form) {
      void form.trigger(name);
    }
  };
}
