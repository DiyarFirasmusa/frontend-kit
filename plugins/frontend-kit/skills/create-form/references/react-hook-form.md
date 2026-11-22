# react-hook-form + zod, only when they are installed

`zodResolver` comes from `@hookform/resolvers/zod`. Paths and names below are the kit's example: an existing form's
pattern wins. Dashboard: the UI kit's `Field`, `Input` and `Select` come first. A field built by hand for a second feature
moves to the shared UI folder, direction-safe (`.claude/rules/rtl.md`).

## 1. Schema — `validations/validations.ts`

```ts
import { z } from 'zod'

export const addressSchema = z.object({
  cityId: z.string().min(1, { message: 'validation.required' }),
  details: z.string().trim().min(3, { message: 'address.detailsTooShort' }),
  phone: z.string().regex(PHONE_PATTERN, { message: 'validation.phoneInvalid' }),
})
export type AddressValues = z.infer<typeof addressSchema>
export const defaultAddressForm: AddressValues = { cityId: '', details: '', phone: '' }
```

`<x>Schema` + `<X>Values` + `default<X>Form`. Messages are translation keys
present in both `ar` and `en`. Reuse the project's shared validators (phone,
email) instead of new regexes.

## 2. Form hook — in the page hook (full-page form) or `hooks/form/use-<x>-form.ts` (dialog)

```ts
export function useAddressForm({ onDone }: { onDone: () => void }) {
  const createAddress = useCreateAddress()
  // With .default, .transform or z.coerce in the schema, input and output differ:
  // useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>, and submit gets the output.
  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultAddressForm,
    mode: 'onTouched',
  })
  const submit = form.handleSubmit((values) => {
    if (createAddress.isPending) {
      return
    }
    createAddress.mutate(values, { onSuccess: onDone })
  })
  return { form, submit, isSubmitting: createAddress.isPending }
}
```

## 3. Markup

```tsx
<form noValidate onSubmit={(event) => { void submit(event) }} className="flex flex-col gap-4">
  <label htmlFor="address-details" className="text-sm font-medium text-foreground">
    {t('address.details')}
  </label>
  <input
    id="address-details"
    {...form.register('details')}
    aria-invalid={Boolean(errors.details)}
    aria-describedby={errors.details ? 'address-details-error' : undefined}
    className="h-12 rounded-full border border-input bg-background px-5 text-foreground focus-visible:border-ring"
  />
  {errors.details ? (
    <p id="address-details-error" role="alert" className="text-sm text-destructive">
      {t(errors.details.message ?? 'validation.required')}
    </p>
  ) : null}
  <button type="submit" disabled={isSubmitting}>{t('common.save')}</button>
</form>
```

(Class names are examples — use the project's tokens.)

## Rules

- `noValidate` on `<form>`; errors inline under the field, translated, linked
  with `aria-describedby`; focus the first invalid field (RHF default).
- Correct input types: `type="tel"` + `inputMode="numeric"` for phone and OTP,
  `autoComplete` (`tel`, `one-time-code`, `name`, `street-address`, `email`).
  Phone / OTP / card / email values `dir="ltr"`; placeholder follows the UI direction.
- Submit through a mutation hook only; never call a service directly. If the
  API client toasts errors, don't toast again; field errors stay inline.
- Single-flight: ignore submits while pending; disable the button.
- Dependent fields: `useWatch`, not `watch()` in render.
- OTP: the length comes from a named constant; paste fills all boxes.
- Website (TanStack Start): a form that posts to a server function still goes
  through a mutation hook so pending and error states stay in one place.
- Test the schema (valid + each invalid) and the form via Testing Library +
  `user-event`, asserting the request body in the MSW handler.
