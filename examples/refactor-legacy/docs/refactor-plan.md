# Refactor plan — legacy-messy

Mode: refactor · profile: react · branch: `feat/live` (from `main`) · audited 2026-11-18.
Behaviour is frozen in every phase. Each phase is one commit; rollback = `git revert <that commit>`.

## Baseline (the safety net)

| Gate | Result |
| ---- | ------ |
| Typecheck `npx tsc --noEmit` | **pass**, 0 errors — but `strict: false` and `.js`/`.jsx` are not checked (`allowJs` without `checkJs`), so it covers 1 of 7 files |
| Typecheck with `--strict` | 0 errors (same blind spot) |
| Lint `npx eslint src` | **red**, exit 2: ESLint 9 finds no `eslint.config.*` |
| Tests | **none**: no test runner, 0 tests |
| Build `vite build` | pass, 1 chunk, 424.84 kB (140.20 kB gzip) |

Baseline is red (lint) and has no tests, so phase 1 comes before anything else.

## Findings

7 source files, 272 lines.

### Structure
- Type folders (`components/`, `helpers/`, `pages/`, `utils.js`), no feature folders.
- `src/App.jsx` is 255 lines in one component (over the ~200 component cap; under 500).
- 2 barrels: `src/components/index.js:1` (`export *`), `src/utils.js:2` (`export * from './helpers/format'`).
- 1 circular import: `src/utils.js:2` → `src/helpers/format.js:1` → `src/utils.js`.
- File names not kebab-case: `App.jsx`, `Button.tsx`, `Users.jsx`; `utils.js` / `helpers/` are banned catch-all names.
- Default exports: `src/App.jsx:8`, `src/pages/Users.jsx:3`.

### Dead code
- 40 functions `handleThing0`…`handleThing39` (`src/App.jsx:18-217`), 0 callers; near-identical copies.
- Unused: `formatMoney2` import (`src/App.jsx:6`); state `users`, `loading`/`setLoading`, `setPage` (`src/App.jsx:10-13`).
- Unused files: `src/pages/Users.jsx` (not imported), `src/components/Button.tsx` + its barrel (not imported).
- `lodash` and `moment` are used only inside the dead `handleThing*` functions → removable dependencies
  (most of the 425 kB bundle).
- No `knip`/`ts-prune`/`depcheck`/`madge` installed; found by grep.

### Types
- `strict: false`; 6 of 7 files are JS (unchecked).
- `any`: 1 (`src/components/Button.tsx:1`). `@ts-ignore`: 0. Casts: 0.
- API responses untyped: `r.data.data` in 3 places.

### Data and state
- axios called directly in components: 3 (`src/App.jsx:16`, `src/App.jsx:17`, `src/pages/Users.jsx:5`).
- Base URL hardcoded `http://localhost:4000/api` in 3 places; no env module.
- Server data copied into `useState`: `orders`, `users`, `u`.
- No loading, error or empty state anywhere; no error handling on any request (unhandled promise rejections).
- `src/App.jsx:17` fetches `/api/users` and never uses the result.

### Forms and UI
- 30 hand-copied order rows (`src/App.jsx:222-251`) instead of a list.
- 30 `<div onClick>` used as buttons (no keyboard, no role).
- Search `<input>` (`src/App.jsx:221`) has no label; `x` close button has no accessible name.
- Modal (`src/App.jsx:252`): no dialog role, no focus handling, no Escape.
- 32 inline `style={{}}`; physical direction: `marginLeft`, `textAlign: "left"`, 30× `paddingLeft`, `marginRight` (Button).
- Hardcoded English strings ("Orders", "Search", "SAR", "x"); the project has no i18n.
- `src/pages/Users.jsx:6`: list items without `key`.

### Kit leftovers
- `kit-prune.sh react` (dry run): nothing to remove.

### Quality
- Test coverage: 0. `console.*`/TODO/FIXME: 0. Secrets in repo: none found.

## Found, not fixed (behaviour bugs; separate tasks, not refactor steps)

1. Search input stores `q` but nothing filters by it (`src/App.jsx:221`).
2. Always renders exactly 30 rows; with fewer orders, empty rows show ` - 0.00 SAR`. A `.map()` refactor would change this,
   so phase 4/5 keeps 30 rows unless you decide otherwise.
3. Page is fixed at 1 (`setPage` never called): no pagination.
4. `formatMoney(n)` uses `toFixed(2)` with `n || 0`, so a string total from the API would throw.

## Phases

### 1. Green baseline — **needs your decision**
- Add `eslint.config.js` (flat config) covering `.js/.jsx/.ts/.tsx`. Parsing `.tsx` needs `typescript-eslint`, and React
  hooks rules need `eslint-plugin-react-hooks`; `@eslint/js` and `globals` are present only transitively. That means
  adding 3–4 devDependencies: **ask before installing**.
- Add a test runner (suggested: Vitest + Testing Library + jsdom) and one characterization test of `App` (renders 30 rows,
  formats money, opens/closes the modal) with axios mocked at the network level (MSW). Also an install: **your call**.
- Files: `eslint.config.js`, `package.json`, `package-lock.json` (via npm), `vitest.config.ts`, `src/app.test.jsx`.
- Done when: `npm run check` exits 0 and the characterization test passes. Lint findings that appear are recorded, not
  silenced.

### 2. Mechanical
- Delete the 40 `handleThing*` functions, unused imports/state, `src/pages/Users.jsx`, `src/components/Button.tsx`,
  `src/components/index.js`; remove `lodash` and `moment` from `package.json`.
- Break the cycle: `formatMoney2` lives with `formatMoney` in one file (`src/lib/format-money.js`); remove `utils.js` barrel.
- Rename to kebab-case (`app.jsx`); add a formatter only if you want one (none today).
- Decision: removing the unused `/api/users` request (`src/App.jsx:17`) drops one network call. No visible change,
  but it is a behaviour change on the wire. Proposed: remove it here; say if you want it kept.
- Done when: gate green, characterization test unchanged, build smaller than 424.84 kB.

### 3. Types
- `tsconfig`: `strict: true`; convert remaining files to `.ts/.tsx` one at a time (`main`, `app`, `format-money`).
- Type the API responses (`Order`, `ApiEnvelope<T>`) in one place.
- Done when: `tsc --noEmit` 0 errors with strict, 0 `any`, 0 JS files in `src/`.

### 4. Structure
- `src/features/orders/` (`orders-page.tsx`, `use-orders-page.ts`, `order-row.tsx`, `order-dialog.tsx`),
  `src/shared/lib/format-money.ts`, `src/shared/api/client.ts` + `src/config/env.ts` (base URL in one place, same value).
- Collapse the 30 copied rows into one `OrderRow` rendered for indices 0–29 (keeps the exact output).
- Named exports only (except where Vite needs a default).
- Done when: no file over 200 lines, no barrels, no cycles, characterization test unchanged.

### 5. Patterns
- One API client; fetching in a hook (`use-orders`). A data library (TanStack Query) is a new dependency: **ask first**;
  otherwise a small typed hook over the client.
- Loading/error/empty states are visible changes → only with your OK (they change behaviour).
- Done when: no axios outside the client, no hardcoded URL outside `config/env.ts`.

### 6. Quality
- Unit tests for `format-money`, hook tests for `use-orders`.
- Accessibility (visible change, needs OK): real `<button>` rows, labelled search, dialog with focus and Escape,
  logical CSS properties.
- Done when: tests cover the moved logic; axe has no serious/critical findings.
