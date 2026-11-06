---
paths:
  - "src/routes/**"
  - "src/router.tsx"
  - "src/features/**/*.tsx"
  - "src/shared/components/**"
  - "src/shared/style/**"
  - "src/shared/assets/**"
  - "vite.config.ts"
---

# Performance (Core Web Vitals on real phones)

Most visitors are on mid-range phones on mobile data. Server rendering gives
a fast first paint; keep it fast by sending little JavaScript, sizing
everything up front and loading only what the next screen needs.

## Budget (mobile, field data)

| Metric | Target |
| ------ | ------ |
| LCP | < 2.5 s |
| INP | < 200 ms |
| CLS | < 0.1 |
| TTFB | < 0.8 s (awaited loader reads are on this path) |
| Route JS | < ~150 KB gzip; no feature code in the shell |

Measure on the **built** server (dev mode is not representative): Lighthouse
mobile, the devtools Performance panel with 4× CPU slowdown and a 4G
profile. Before/after numbers for every performance change.

## TTFB: what the loader awaits

- Await only what the first HTML needs (main content, head data). Everything
  below the fold streams (see `data-loading.md`).
- Awaited reads run in parallel, never one after another.
- Slow third-party calls never sit on the awaited path.

## No layout shift

The user checks every screen on a phone and rejects any jump.

- Reserve space before content arrives: skeletons and `pendingComponent`s
  with the final size, fixed-height rows for async values (prices, counters,
  badges), `min-h-*` on sections that stream in.
- Images always have `width` + `height` or an `aspect-*` box.
- `<html lang dir>` and the theme are right in the first HTML (no flip after
  hydration); fonts use `font-display: swap` with a metric-matched fallback.
- Banners, cookie bars and "open in app" prompts overlay or reserve their
  space; they never push content down after load.
- Animate `transform` and `opacity`, never `width`, `height`, `top`, `margin`.

## Images (usually the LCP)

- The LCP image: eager, `fetchPriority="high"`, sized, and preloaded from the
  route's `head()` (`links: [{ rel: 'preload', as: 'image', href, imageSrcSet }]`)
  when it is known in the loader.
- Everything else: `loading="lazy"`, `decoding="async"`.
- `srcset` + `sizes` so phones download phone-sized files; WebP/AVIF from the
  image host. Never ship a 2000px image into a 360px slot.
- Carousels and marquees move with `transform` only; only the first slide is
  eager.

## Fonts

- Self-hosted woff2, only the weights and subsets used (Arabic + Latin).
- Preload the one weight the above-the-fold text uses, from `__root.tsx`
  `head()` links. No more than two preloaded fonts.

## JavaScript

- Route components are code-split by Start; never import a page container
  from a layout, store or shared component — it pulls the page into the shell.
- Heavy, rarely used libraries (charts, QR, rich editors, maps) load inside
  the component that needs them, behind an interaction where possible.
- Below-the-fold interactive islands can defer hydration with `<Hydrate>`
  (`@tanstack/react-start`) when profiling shows hydration cost on the main
  thread.
- Third-party scripts (analytics, chat) load after hydration, never in the
  `<head>` blocking path.

## Navigation speed

- `defaultPreload: 'intent'`: hovering or touching a `<Link>` preloads the
  route chunk and its loader data. Keep links real `<Link>`s so this works.
- Lists of product tiles can use `preload="viewport"` on the tile links when
  the next tap is very likely.
- Catalogue `staleTime` in minutes so back-navigation is instant.

## Rendering

- Zustand selectors, never whole-store subscriptions.
- Stable keys (ids) on lists; long lists paginate or virtualise.
- Debounce search input; throttle scroll handlers with `requestAnimationFrame`.
- `memo` / `useMemo` / `useCallback` only where the profiler shows wasted renders.

## Caching at the edge

- Static assets are fingerprinted by the build: long `immutable` cache.
- Public HTML may get a short `s-maxage` + `stale-while-revalidate` from
  `headers()` only when it does not vary by cookie; personalised HTML is
  `private, no-store`. The host config is owned by deploy; recommend, don't edit.
