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
  const form = useFormContext() as UseFormReturn<FieldValues> | null;

  return () => {
    if (enabled && form) {
      void form.trigger(name);
    }
  };
}
