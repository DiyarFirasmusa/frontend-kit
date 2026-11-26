# React performance rules (condensed)

Condensed from Vercel Engineering's React best practices (MIT, see `THIRD_PARTY_NOTICES.md`): the rules that apply to a
Vite SPA or TanStack Start site. Only for a project with React. The Next.js and server-component rules are left out; where a
rule names an API, use the project's equivalent (`next/dynamic` is `React.lazy` or `import()`). The project's rules
(`react.md`, `quality-bar.md`) and measurements win: change only what a measurement points at.

## 1. Waterfalls (critical)

- Check a cheap synchronous condition before awaiting a flag or remote value.
- Move `await` into the branch that needs it; don't block code that doesn't.
- `Promise.all` for independent work; start a promise early, await it late.
- Stream with Suspense boundaries so the shell doesn't wait for slow data.

## 2. Bundle size (critical)

- Import from the module, not a barrel file; prefer statically analyzable import paths.
- Heavy components load on demand (`React.lazy`, `import()`); third-party analytics and logging load after hydration.
- Load a module only when its feature is switched on; preload on hover or focus for perceived speed.

## 3. Client-side

- One global event listener per event, shared; passive listeners for scroll and touch.
- localStorage: a versioned, minimal schema; cache reads instead of reading in loops.

## 4. Re-renders

- Don't subscribe to state that is only read in callbacks; subscribe to a derived boolean, not the raw value.
- Derive state during render, not in an effect; put interaction logic in the event handler, not an effect.
- Primitive effect dependencies; split a hook whose parts have different dependencies.
- Functional `setState` for stable callbacks; `useState(() => expensive())` for expensive initial values.
- Hoist a default non-primitive prop out of the component; don't wrap a simple primitive expression in `useMemo`.
- Extract expensive work into a memoized component; never define a component inside a component.
- `startTransition` / `useDeferredValue` for non-urgent updates and heavy renders; refs for transient, frequently changing values.

## 5. Rendering

- Hoist static JSX out of components; `content-visibility: auto` for long lists; animate a wrapper `div`, not the `svg`.
- Ternary, not `&&`, when the left side can be `0` or `''`.
- Prefer `useTransition` for loading state; `Activity` to hide and show without losing state.
- Hydration: an inline script for client-only data that must not flicker; suppress only the expected mismatches.
- Preload with React DOM resource hints; `defer` or `async` on script tags; reduce SVG coordinate precision.

## 6. JavaScript

- A `Map` or `Set` for repeated lookups; build the index once.
- Combine several `filter` / `map` passes into one loop, or `flatMap`; return early; check array length before an expensive comparison.
- Min and max with a loop, not a sort; `toSorted()` instead of mutating; hoist `RegExp` out of loops.
- Cache property access in hot loops and repeated function results in a module-level `Map`.
- Batch DOM and CSS changes through a class or `cssText`; defer non-critical work to `requestIdleCallback`.

## 7. Advanced

- Store event handlers in refs for a stable subscription; keep `useEffectEvent` results out of effect dependencies.
- Initialise app-wide things once per app load, not once per mount.
