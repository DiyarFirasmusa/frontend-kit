import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

export interface SwitchFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: SwitchFieldProps<T>) {
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <div className="flex w-full flex-row items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-0.5">
              {label ? <FormLabel>{label}</FormLabel> : null}
              {description ? <FormDescription>{description}</FormDescription> : null}
              <FormMessage>
                {fieldState.error?.message ? t(fieldState.error.message) : null}
              </FormMessage>
            </div>
            <FormControl>
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
}
