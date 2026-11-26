---
paths:
  - 'src/style/**'
  - 'scripts/generate-tokens.ts'
  - 'src/components/ui/**'
  - 'src/components/table/**'
  - 'public/theme-init.js'
---

# Styles and design tokens

The design lives in TypeScript under `src/style/tokens/` and is generated into two
CSS files. Never edit `theme.css` or `preset.css` by hand: change the source and
run `npm run tokens`; `tokens.test.ts` fails when they differ.

- Colours: `tokens/presets/neutral.ts` (default) and `ocean.ts`; each preset has a
  light and a dark set. Add a preset by copying `neutral.ts`, adding it to
  `presets/index.ts`, then `npm run tokens` and `npm run test` (a contrast test
  checks every text pair at 4.5:1 and the focus ring at 3:1).
- Everything else is in `tokens/foundation.ts`: fonts, role-named spacing
  (`gap-field`, `p-card`), radii, shadows, motion, density (`control-h*`, `field-h`,
  `row-h`), the type ramp (`text-h1` ... `text-table-id`) and `TYPE_RAMP_ARABIC`.
- Type utilities set size, line height, weight and family together: never pair
  `text-b2` with `font-*` or `tracking-*`. CSS files use `font: var(--font-b2)`.
- `primary` is a fill. Text uses `text-primary-text`; brand accents use `brand`.
  Status colours (`success`, `warning`, `danger`, `info`) carry meaning only, and
  a status is never colour alone (a label or icon too).
- No hex or `rgb()` colours in components (`conventions.test.ts`). No `ml-`/`mr-`/
  `left-`/`right-`: logical properties only.
- Table body rows use the `--row-h` token (`ROW_HEIGHT_CLASS` in
  `components/table/data-table-row.tsx`), so the skeleton and the rows never differ.
- One global focus ring (`--primary-highlight`) in `styles.css`; one global
  reduced-motion rule. Do not add per-component focus styles or raw `150ms` durations
  (`--duration-*`).
- The theme (`light` / `dark` / `system`), preset, density, `lang` and `dir` are set
  on `<html>` by `public/theme-init.js` before first paint (an external file, so a
  strict `script-src 'self'` keeps working).
- Repeated component styling belongs in a family file (`button.css`, `input.css`,
  `select.css`, `badge.css`, `tabs.css`); one-off layout stays in Tailwind classes.
- Fonts are local `@fontsource` packages; never a CDN link.
