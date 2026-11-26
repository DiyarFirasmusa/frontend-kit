---
paths:
  - 'src/style/**'
  - 'scripts/generate-tokens.ts'
  - 'src/components/ui/**'
  - 'src/components/common/**'
  - '**/*.css'
---

# Styles and design tokens

- One token system for the site and the admin. The source is TypeScript in `src/style/tokens/`
  (`presets/*.ts` colours in light and dark, `status.ts`, `foundation.ts` fonts, spacing, radius, type ramp).
  `src/style/theme.css` and `preset.css` are generated: run `npm run tokens` after changing a token, never edit them.
  `tokens.test.ts` fails when they are out of date; `contrast.test.ts` fails on a colour pair under WCAG AA.
- One stylesheet (`src/style/styles.css`) is loaded by every page. Component CSS (`button.css`, `input.css`,
  `select.css`, `pagination.css`, `actions.css`, `badge.css`) is imported there. Small components use Tailwind
  token utilities; add a CSS file only for what utilities cannot express.
- Use role-based names: `bg-background`, `bg-surface`, `text-text-primary`, `text-text-muted`, `border-stroke`,
  `bg-primary text-primary-foreground`, spacing like `p-card` and `gap-row`. No hex or `rgb()` in components, no
  arbitrary pixel values for spacing, no inline `style=` (the CSP forbids inline styles in production).
- Logical properties only (see the i18n-rtl rule). Dark mode follows the system through CSS, and the theme button
  sets `data-theme` before first paint (a script in `__root.tsx`, with the nonce).
- The focus ring and reduced motion are single global rules in `styles.css`: do not remove outlines in components.
- Base UI: the admin wraps its tree in `<CSPProvider disableStyleElements>` (`AdminRoot`) because Base UI would inject a
  `<style>` that `style-src 'self'` blocks; the two rules it needs live in `select.css`. No toast, tooltip or modal
  library that injects styles at runtime (the toaster is hand-written for that reason).
- Two button systems exist: the site uses the constants in `components/common/button-styles.ts`; the admin and the shared
  primitives use `components/ui/button.tsx` (`buttonVariants`). Use the second for anything new that both sides need.
- Fonts are local (Cairo, preloaded for Arabic pages). Images get width and height. No third-party fonts or CDNs.
