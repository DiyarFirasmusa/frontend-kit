---
name: performance
description: Make the app faster on real phones and slow networks - route splitting, LCP images, layout shift, fonts, query caching, re-renders, memoisation, bundle size, waterfalls, SSR loading. Use to speed up a page, cut load time, fix layout shift, improve Lighthouse, or review a React change for speed.
---

# Performance

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/wajiha-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

Assume mid-range phones on mobile data unless `CLAUDE.md` says otherwise.
Measure before and after, and change only what the measurement points at.

## Budget

| Metric | Target (mobile) |
| ------ | --------------- |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Route chunk | < ~150KB gzip |
| Initial JS (shell) | as small as possible; no feature code |

## Measure

```sh
npm run build              # chunk sizes where the tool prints them (Next.js 16 does not)
npm run build:analyze      # treemap, when the project has the script
npm run preview            # then Lighthouse, mobile preset
```

Run the same command before and after and take the median of several runs; say "lab only" when there is no field data.

Chrome devtools Performance panel with CPU 4× slowdown + "Fast 4G" for
interactions. Use UAT (<uatHost>) or local builds, never load-test
<liveHost>.

## Loading

The budget, measuring and principles hold in any stack. A line that names a library is the example for a project that has
it: use the project's equivalent, don't add the library.

- Routes are split. With TanStack Router by TanStack Router (`autoCodeSplitting` in the router
  plugin). Never import a route's components eagerly from a layout, store or
  shared component — it drags the feature into the shell.
- Heavy, rarely used libraries (charts, date pickers, QR, PDF/image
  generation, rich editors) are imported only in the component that needs
  them, or with `import()` on demand.
- Prefetch the next likely page: `<Link preload="intent">` and
  `queryClient.query(options).catch(() => undefined)` in the route `loader` (Query 5.102+).
- Website (TanStack Start): load above-the-fold data in the route `loader`
  (`await queryClient.query(options)`) so the HTML arrives with content; keep the rest
  client-side. No hydration mismatches (dates, random ids, `window` in render).
- Dashboard (Vite + TanStack Router): start the page's queries in the
  `loader` so they run in parallel with the chunk download.

## Images (usually the LCP)

- The hero / first visible image: eager, `fetchPriority="high"` (the JSX spelling), sized.
- Everything below the fold: `loading="lazy"`, `decoding="async"`.
- Always `width` + `height` or an `aspect-*` box → no CLS.
- Serve close to display size; prefer WebP/AVIF.
- Marquees and carousels animate `transform` only.

## Fonts

Self-hosted woff2, `font-display: swap`, only the weights used. Preload the
above-the-fold weight if LCP text waits on it. Arabic fonts are large —
subset when the project allows.

## Data

- Reference data that changes rarely → sensible `staleTime` (minutes) so
  back-navigation is instant. Carts, balances, live status stay fresh.
- No waterfalls: start independent queries together; don't wait for a list to
  start a detail you already know the id of.
- Don't over-fetch: page sizes match what is shown. Tables paginate on the
  server.

## Rendering

- The smallest subscription a view needs (Zustand: selectors), never a whole store.
- Stable `key`s (ids, never index) on lists.
- `useMemo` / `memo` only where the profiler shows wasted renders.
- Debounce search input; throttle scroll handlers with `requestAnimationFrame`.
- Long lists and big tables paginate or virtualise.

## Report

Before/after numbers for each change, ordered by impact for effort.

## React rules

For a React project asked for a performance audit (re-renders, memoisation, bundle size, waterfalls, slow interactions),
read `${CLAUDE_SKILL_DIR}/references/react-rules.md` and apply only the rules that fit the project's stack.
