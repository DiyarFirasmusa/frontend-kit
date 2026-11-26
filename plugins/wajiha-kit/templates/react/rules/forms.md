---
paths:
  - "**/src/**/{forms,form,validations,schemas,fields}/**"
  - "**/src/**/*{form,Form,schema,validation}*.{js,jsx,ts,tsx,vue,svelte}"
  - "{components,pages}/**/*{form,Form,schema}*.{js,jsx,ts,tsx,vue,svelte}"
---

# Forms

Use the form library the project already has (`react-hook-form`, Formik, TanStack Form, native). Do not mix two.

- **One schema** per form (zod, yup, valibot, …) is the source of validation and of the TypeScript type.
- **Messages are i18n keys**, not hardcoded strings; show them inline under the field with `aria-describedby`.
- **Every input has a visible label** (or `aria-label` for icon-only), a correct `type`/`inputMode`/`autocomplete`.
- **Single-flight submit**: disable the submit button and ignore a second submit while the mutation is pending;
  re-enable on error.
- **Map backend field errors onto the inputs**; unknown errors become one toast/banner, not silence.
- **Dirty guard**: leaving a form with unsaved changes asks first (router blocker or `beforeunload`).
- **Never log or toast field values** (passwords, tokens, personal data).
- **Destructive actions** (delete, reset) ask for confirmation naming what will be lost.
