# my-dashboard

An admin dashboard starter: **React 19 + Vite SPA**, TanStack Router and Query,
Tailwind CSS 4, Base UI, react-hook-form with zod, i18next. Arabic (RTL, the
default) and English (LTR), light and dark, a neutral theme you can re-brand in
one file.

It ships with five demo pages (home, warehouses, suppliers, categories, units of
measure) running on in-browser mock data, so it works with no backend.

## Start

```bash
npm install
npm run dev          # http://localhost:3000, mock data on, sign in with any name and password
```

Needs Node 22.18 or newer. To talk to a real backend, copy `.env.example` to
`.env`, set `VITE_API_BASE_URL` and set `VITE_USE_MOCK` to `"false"`.

## Commands

| Command                               | What it does                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`                         | Dev server (also regenerates `src/routeTree.gen.ts`)                                    |
| `npm run build` / `npm run preview`   | Production build and a local preview of it                                              |
| `npm run typecheck`                   | `tsc --noEmit`                                                                          |
| `npm run lint:check` / `npm run lint` | oxlint, fails on warnings / fixes                                                       |
| `npm run fmt:check` / `npm run fmt`   | oxfmt, check / write                                                                    |
| `npm run test`                        | Vitest (unit, component, token contrast, conventions)                                   |
| `npm run test:e2e`                    | Playwright + axe in Arabic and English, light and dark (run `npm run e2e:install` once) |
| `npm run tokens`                      | Regenerate `src/style/theme.css` and `preset.css` from `src/style/tokens`               |
| `npm run icons`                       | Render the PNG icons from `public/icon.svg`                                             |
| `npm run i18n:validate`               | Fail when a language is missing keys another has                                        |
| `npm run check`                       | typecheck + lint + format + test                                                        |

## Make it yours

- **Name**: `package.json` `name`, `index.html` `<title>`, `shell.brand` in `src/locales/*.json`, `public/icon.svg`.
- **Colours**: copy `src/style/tokens/presets/neutral.ts`, change the `primary-*` family, add it to
  `presets/index.ts`, run `npm run tokens`. `npm run test` checks every text pair for contrast.
  Switch presets at runtime with `data-preset` on `<html>` (the theme provider does it).
- **Languages**: `src/lib/i18n/languages.ts` is the one list; the file explains the steps for a third language.
- **Permissions**: see [PERMISSIONS.md](PERMISSIONS.md).
- **Optional modules** (off by default): PWA in `src/modules/pwa/README.md`.

## Where things are

[STRUCTURE.md](STRUCTURE.md) (in Arabic) explains every folder, the shape of a feature,
the three style files, and what changed from the first playground and why.

## Before you publish

- Replace `public/icon.svg`, run `npm run icons`.
- Remove the mock data you do not want: `src/mocks/` and the `VITE_USE_MOCK` lines.
- Decide the real API contract: endpoints are in `src/constants/api.ts`, DTOs in `src/types/api/`.
- Add a `LICENSE` file if you publish the project.
