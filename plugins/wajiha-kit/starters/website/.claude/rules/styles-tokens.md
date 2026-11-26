---
paths:
  - 'src/shared/style/**'
  - 'src/shared/components/**'
  - '**/*.css'
---

# Styles and design tokens

- One hand-written token file: `src/shared/style/tokens.css` (colours in light and dark, the font stacks, radius,
  spacing, the type ramp). Nothing is generated. `styles.css` imports Tailwind, the font and the tokens, and holds the
  few global rules (focus ring, `surface-primary`, `icon-directional`, reduced motion).
- Use role-based utilities: `bg-bg`, `bg-surface`, `bg-surface-sunken`, `text-text`, `text-muted`, `text-primary`,
  `border-border`, `text-danger`, `bg-primary text-on-primary`, `p-gutter`, `py-section`, `shadow-card`. No hex or
  `rgb()` in components, no arbitrary pixel values for spacing, no inline `style=` (the CSP forbids inline styles in
  production).
- Changing a colour: edit the light value and the dark value (the dark values appear twice in `tokens.css`:
  `:root[data-theme='dark']` and the `prefers-color-scheme` block), keep `themeColor` in `src/config/site.config.ts` in
  step, and keep text contrast at AA (4.5:1): `e2e/ui/a11y.spec.ts` runs axe in light and dark.
- A coloured block that holds buttons or links uses the `surface-primary` utility, not `bg-primary`: it also sets
  `--focus`, so the focus ring stays visible inside it.
- Buttons and cards: the class constants in `src/shared/components/button-styles.ts` (`buttonPrimary`,
  `buttonSecondary`, `card`), joined with `cx`. Touch targets are at least `min-h-11`.
- Dark mode follows the system through CSS. The theme button sets `data-theme` and saves it; a small inline script in
  `__root.tsx` (with the request nonce) applies a saved choice before the first paint. `ThemeToggle` and
  `theme-store.ts` own that: do not set `data-theme` anywhere else.
- Fonts are local: Cairo (variable) from `@fontsource-variable/cairo`, preloaded on Arabic pages in `__root.tsx`;
  English uses the system font stack. No third-party fonts, CDNs or icon fonts (the CSP allows none). Icons are small
  inline SVG components in `src/shared/components/icons.tsx`.
- Images go through `Picture` with width and height (no layout shift: `e2e/ui/layout-shift.spec.ts` fails above CLS
  0.01). The covers are SVG, so article pages keep the default PNG share image.
- No library that injects `<style>` at runtime (the CSP is `style-src 'self'`). If you add one that does, look for the
  option that turns the injection off and move the few rules it needed into a CSS file; the e2e CSP check will show
  you if you missed one.
