---
paths:
  - "src/**/*.{ts,tsx}"
---

# React + TypeScript

React 19, strict TypeScript, Next.js 16 App Router (`src/app`). Components are
Server Components by default; add `'use client'` only on the smallest component
that needs state, effects or browser APIs. This Next.js version has breaking
changes: read the matching guide in `node_modules/next/dist/docs/` (see
`AGENTS.md`) before using a Next.js API.

## TypeScript

- Strict. Never `any` — use `unknown` and narrow. Never `@ts-ignore` /
  `@ts-expect-error`; fix the type.
- Type-only imports use `import type`.
- `interface` for object shapes, `type` for unions and aliases.
- Backend shapes come from one place (generated or hand-written API types).
  Fields stay exactly as the API sends them.
- Enum-like values: `const X = { … } as const` + a union type. Config
  objects: `as const satisfies T`.
- Avoid non-null `!`; check and narrow instead.

## Components

- Function components only, props typed with an interface above the component.
- Every component is a **named** export, one exported component per file.
  Exception: files Next.js requires a default export from (`page.tsx`,
  `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, …).
- Markup used once stays inline in its page as a local, non-exported function.
  Create a `components/` file only when it is reused or the page grows past
  readability.
- Presentational components take data via props and report via callbacks
  (`onRemove`, `onSelect`). They never fetch or mutate.
- Keep the client boundary low: a page stays a Server Component and passes
  serialisable props to small client components.

## Route files render, hooks and functions think

`page.tsx` reads `params` / `searchParams`, loads data (server-side, through a
service function) and renders the page component. Client-side orchestration
(local UI state, mutations, derived values, callbacks) lives in one page hook
(`use-<page>-page.ts`) that returns one object; the client component holds no
`useState`, `useEffect` or fetch of its own.

## Hooks

- No `useEffect` for fetching. Server data is loaded in Server Components or
  through the project's data layer once it has one (`data-and-state.md`).
- `useMemo` / `useCallback` only when it is measurably needed or the value is
  a dependency of another hook / a memoised child.
- Floating promises get `void`: `onClick={() => { void save() }}`.
- Single-flight actions (submit, pay) guard on the pending state **and** a
  ref, so a second tap during the request does nothing.

## Navigation

- `Link` from `next/link` for anything a user clicks to go to another page
  (a real `<a href>`), not a `div` or `button` with `router.push()`.
- URL state (tab, filter, page, sort) lives in search params, parsed and
  validated once at the page boundary with defaults.
- Missing data → the framework's not-found; redirects use the framework's
  redirect, with targets validated against an allow-list.

## Server and client

- No `window`, `document` or `localStorage` during render — only in effects
  and event handlers. Anything that differs between server and client
  (dates, random ids) must not cause a hydration mismatch.
- Server-only code (secrets, private keys, direct backend calls) is never
  imported from a `'use client'` module. Only `NEXT_PUBLIC_*` env vars reach
  the browser.

## Imports

Third-party, then the `@/…` alias, then relative.
Relative inside a feature, the alias across features and into shared code.
The HTTP library is imported only inside the API client.

## Never

- Class components, default exports (except where Next.js requires one).
- `console.log`, `debugger`, commented-out code.
- Inline `style={{}}` except for truly dynamic values (a computed width,
  a CSS variable); never `!important`.
- `dangerouslySetInnerHTML` with backend data.
- Files over 500 lines — split by extracting hooks first, then components.
