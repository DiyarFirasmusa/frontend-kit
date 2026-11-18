---
paths:
  - "src/**/*.{tsx,css}"
---

# Styles

Tailwind CSS v4 with design tokens (mirrored from the Figma file when there
is one). The tokens, dark overrides and the few component classes live in the
theme CSS file named in `project.md`. Every visual change is checked in
**light and dark**, **Arabic and English**, **phone and desktop**.

## Colour: semantic tokens only

Use the semantic utilities the theme defines (background, surface, text,
icon, border, action, status, overlay). They re-point under the dark theme,
so a component written with them needs no `dark:` variant.

- Never hardcode hex or `rgb()` in JSX. A value missing from the tokens is
  added to the theme file (primitive + semantic + dark override), not
  inlined. Older code with hex values: replace them when you touch it.
- Primitives (the raw palette behind the tokens) only when no semantic token fits.
- Muted / tertiary text is for placeholders and meta only. Body copy uses the
  primary / secondary text tokens and must reach 4.5:1 in both themes.
- One primary call to action per surface, styled with the action tokens.

## Typography

- The project's font (self-hosted, `font-display: swap`), with an Arabic face
  that is as readable as the Latin one.
- Keep to the existing size steps rather than inventing new ones; when the
  design gives pixel sizes, map them to those steps. Weights: `font-medium`,
  `font-semibold`, `font-bold`.
- No positive letter-spacing on Arabic. Western digits with `tabular-nums`
  for prices, counters, table numbers and OTP.

## Layout and responsive

- **Mobile first.** Write the phone layout unprefixed, widen with
  `sm:` / `md:` / `lg:`. No horizontal page scroll at 360px (a wide table
  scrolls inside its own container). Touch targets ≥ 44px.
- Logical properties only (`ps-` / `pe-` / `ms-` / `me-` / `start-` / `end-`);
  see `.claude/rules/rtl.md`.
- Use the radii and shadows the design system already uses. Delineate with a
  subtle border before reaching for a shadow; shadows stay light.

## Component classes

The theme file may hold a few `@layer components` classes or `@utility`
rules for pieces whose geometry is shared or animated. Reuse them; add a new
one only when two places share non-trivial geometry or keyframes. Dashboard:
prefer the UI kit's variants (`cva`) over new CSS classes.

## Icons and images

- One icon family (as `project.md` names, e.g. `lucide-react`). Decorative
  icons get `aria-hidden="true"`; icon-only buttons get an `aria-label`.
  Directional icons mirror with `rtl:-scale-x-100`.
- Images: `width` / `height` (or an `aspect-*` box) to avoid layout shift,
  `loading="lazy"` below the fold, `alt` always.

## Motion

Short (150–300ms), purposeful, `transition-colors` / `transition-transform`.
Respect `motion-reduce:` for anything that moves more than a few pixels.

## No layout shift

The user checks every screen on a phone and rejects any jump. Reserve space
before content arrives: skeletons with the final size, images with
`width`/`height` or `aspect-*`, fixed-height rows for async values (prices,
counters, badges), `min-h-*` on panels that load. Animate `transform` and
`opacity`, never `width`, `height`, `top` or `margin`. Keep sibling spacing on
one scale (the same `gap-*` across a list, phone and desktop alike).

## Never

- Hex colours, inline `style={{}}` for static values, `!important`.
- Blanket descendant overrides (`[&_*]:text-[15px]`).
- `dark:` variants to patch a hardcoded colour — use the token.
- Physical `left` / `right` utilities for layout.

## Token names

One vocabulary, defined in `theme.css` (light + dark): `background`, `surface`, `surface-dim`, `foreground`, `muted`,
`border`, `input`, `ring`, `primary` / `primary-foreground` / `primary-soft`, and `success`, `warning`, `danger`,
`info` each with a `-soft` variant, `neutral-soft`, `overlay`. Utilities: `bg-surface`, `text-muted`,
`border-border`, `text-danger`… Components use these and need no `dark:` variant. A new colour is a new token, not a
hex in a component.

## Horizontal scrollers

Every carousel, rail or nav strip with `overflow-x-auto` is also `relative`: an
absolutely positioned child (a visually hidden label) escapes the clip of a
non-positioned scroller and widens the whole page silently. Playwright asserts
`document.documentElement.scrollWidth <= innerWidth` at 375px in both languages.
