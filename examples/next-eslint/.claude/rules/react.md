---
paths:
  - "src/**/*.{ts,tsx}"
---

# React + TypeScript

The project's own pattern wins over the file, export and folder examples here (`project.md`, the nearest code).
React 19, strict TypeScript, Next.js 16 App Router (`src/app`). Components are
Server Components by default; add `'use client'` only on the smallest component
that needs state, effects or browser APIs. This Next.js version has breaking
changes: read the matching guide in `node_modules/next/dist/docs/` (see
`AGENTS.md`) before using a Next.js API.

## TypeScript

- Strict. Never `any` — use `unknown` and narrow. Never `@ts-ignore` /
  `@ts-expect-error`; fix the type.
- Data from outside the type system (`JSON.parse`, `response.json()`, storage, URL, env) is `unknown` until it is
  parsed (type guards until the project has a schema library); auth, permission and money responses too, whatever their
  generated type says. No cast after.
- Type-only imports use `import type`.
- `interface` for object shapes, `type` for unions and aliases.
- Backend shapes come from one place (generated or hand-written API types).
  Fields stay exactly as the API sends them.
- Enum-like values: `const X = { … } as const` + a union type. Config
  objects: `as const satisfies T`.
- Avoid non-null `!`; check and narrow instead.

## Components

- Function components (the one error boundary excepted), props typed with an interface above the component.
- React 19: `ref` is a prop (no new `forwardRef`), callback refs use a block body, `useRef` takes an argument, and
  `ref.current` is never touched during render.
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

- No hand-rolled fetch in `useEffect`: server data is loaded in Server Components or
  through the project's data layer once it has one (`data-and-state.md`). No server data in a client store.
- Derive during render; reset state with a `key` on the entity id; store the id, not the object. External stores use
  `useSyncExternalStore`. Every effect cleans up.
- `use(promise)`: a stable promise (never created in render), a boundary above, no `try`. An update that suspends runs
  in a transition.
- `useMemo` / `useCallback` only when it is measurably needed or the value is
  a dependency of another hook / a memoised child.
- Floating promises get `void`: `onClick={() => { void save() }}`.
- `useEffectEvent` (19.2+, like `<Activity>`; `<ViewTransition>` is 19.3): declared at the top level, its function called
  only from effects or other Effect Events, never a dependency or a prop.
- One submit mechanism per form: `<form action>` (it resets uncontrolled fields) or an `onSubmit` handler.
- A handler over 50 ms is split and yields (`scheduler.yield()` where it exists, else a timeout).
- Single-flight actions (submit, pay) guard on the pending state **and** a
  ref, so a second tap during the request does nothing.

## Navigation

- `Link` from `next/link` for anything a user clicks to go to another page
  (a real `<a href>`), not a `div` or `button` with `router.push()`.
- URL state (tab, filter, page, sort) lives in search params, parsed and
  validated once at the page boundary with defaults.
- Missing data → the framework's not-found; redirects use the framework's
  redirect, with targets validated as same-site paths.

## Server and client

- No `window`, `document` or `localStorage` during render — only in effects
  and event handlers. Anything that differs between server and client
  (dates, random ids) must not cause a hydration mismatch.
- Server-only code (secrets, private keys, direct backend calls) is never
  imported from a `'use client'` module. Only `NEXT_PUBLIC_*` env vars reach
  the browser.

## Edges

- Inline JSON in a script escapes `<`; a redirect target from input is validated after normalising.
- Numbers, money and dates go through the project's formatter (`project.md` names it).

## Imports

Third-party, then the `@/…` alias, then relative.
Relative inside a feature, the alias across features and into shared code.
The HTTP library is imported only inside the API client.

## Never

- Class components, except one reusable error boundary (React has no hook for that). Default exports, except where
  Next.js or another tool requires one.
- `console.log`, `debugger`, commented-out code.
- Inline `style={{}}` except for truly dynamic values (a computed width,
  a CSS variable); never `!important`.
- `dangerouslySetInnerHTML` with unsanitised data from outside the repo.
- Files over 500 lines — split by extracting hooks first, then components.
