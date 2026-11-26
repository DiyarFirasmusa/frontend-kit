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

Needs Node 22.18 or newer (`.nvmrc`).

### Use your real API

In dev, Vite reads `.env.development` (the committed demo values, mocks on) over
`.env` and `.env.local`, so put your values in **`.env.development.local`**, which
wins over all of them and is gitignored:

```bash
cp .env.example .env.development.local   # then edit it
# VITE_USE_MOCK="false"
# VITE_API_BASE_URL="https://api.your-company.example"
# VITE_AUTH_REFRESH="cookie"   # refresh token in an HttpOnly cookie (recommended)
```

Restart `npm run dev`. For builds use `.env.production.local` (or CI variables).

### Sessions and tokens

The access token lives in memory only; nothing goes to `localStorage`.
`VITE_AUTH_REFRESH` picks where the refresh token lives: `"cookie"` (the backend
sets an HttpOnly cookie; refresh, login and logout are sent with credentials, so
CORS must allow them) or `"session"` (default, used by the demo: `sessionStorage`,
which a script on the page can read, so the backend must rotate and expire it).
A reload restores the session with one refresh before the first render; tabs
share one refresh at a time (Web Locks) and a sign-out in one tab signs out the
others.

### Opening the demo from another device

The mock API runs in a service worker, which browsers allow only on `localhost`
or `https`. Opened over plain `http` on a LAN or VPN address, the app shows a
page that says so instead of starting. Use `https`, or point the app at a real
API (`VITE_USE_MOCK="false"`).

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

## Add an entity

Copy the suppliers feature; the steps and the exact files are in
[STRUCTURE.md](STRUCTURE.md#إضافة-كيان-جديد) and `src/features/dashboard/README.md`.

## Make it yours

- **Name**: `package.json` `name`, `index.html` `<title>`, `shell.brand` in `src/locales/*.json`, `public/icon.svg`,
  and the PWA manifest name in `vite/pwa.ts` if you turn the PWA on.
- **Colours**: copy `src/style/tokens/presets/neutral.ts`, change the `primary-*` and `brand-*` families, add it to
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
- Decide the real API contract: endpoints are in `src/constants/api.ts`, DTOs in `src/types/api/`
  (hand-written for the demo; with an OpenAPI file, generate them, e.g. `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
  The paged list and error shapes the demo assumes are in `src/types/api/page.ts`.
- Add a `LICENSE` file if you publish the project.
