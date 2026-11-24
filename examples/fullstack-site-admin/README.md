# fullstack-site-admin

A site and an admin in one TanStack Start tree, `fullstack` profile.

Only the kit's output is here (the app is about 270 files and not needed to read the setup). Layout it was run on:

```text
src/routes/_site/ _site.tsx   the public site (SSR)
src/routes/admin/ admin.tsx   the admin (ssr:false, guard, its own providers)
src/features/ shared/         the site's code
src/admin/                    the admin's code (api, components, features, guards, store, locales, ...)
```

## What setup decided
- **Scoped rules:** website rules apply to `src/features|shared` and `src/routes/_site`; the dashboard rules were copied as `admin-<name>.md` and their paths moved under `src/admin` and `src/routes/admin`, so reading an admin file loads `admin-api-layer.md` and not the site's `api-layer.md` (checked with an `InstructionsLoaded` hook log).
- **Per app commands:** `apps` in `.claude/wajiha-kit.json` gives each app its own `i18nValidate` and `relatedTests`.
- **No skill deny rules:** both apps' skills stay available.

Read `.claude/wajiha-kit.json` (the `apps` block), then `.claude/rules/admin-api-layer.md` versus `.claude/rules/api-layer.md`.

Back to the [examples index](../README.md).
