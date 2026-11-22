# React + TanStack Router, only when the project uses them

The names and libraries below are the kit's example for that stack. An existing component's pattern wins.
Website and dashboard profiles: the UI kit primitives (base-ui / shadcn-style) come first.

## Example

```tsx
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

interface SummaryCardProps {
  title: string
  itemId: string
  imageUrl: string
  amountLabel: string
}

export function SummaryCard({ title, itemId, imageUrl, amountLabel }: SummaryCardProps) {
  const { t } = useTranslation()
  return (
    <Link
      to="/items/$itemId"
      params={{ itemId }}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-ring"
    >
      <img src={imageUrl} alt={title} width={160} height={160} loading="lazy" className="aspect-square w-full object-contain" />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {t('items.totalLabel')} <span dir="ltr" className="tabular-nums">{amountLabel}</span>
      </p>
    </Link>
  )
}
```

The class names above are examples; use the project's own semantic tokens
(`.claude/rules/styles.md`).

## Rules

- kebab-case file, PascalCase named export, one exported component per file, no barrels.
- Presentational: props in, callbacks out (`onAdd`, `onRemove`). No fetching,
  no mutations, no `useNavigate` for plain navigation (use `<Link>` with a
  typed `to` + `params`).
- Tokens only — no hex, no inline static styles. Mobile-first classes.
  Logical properties; directional icons `rtl:-scale-x-100`.
- Every string via `t('group.key')` in Arabic + English. Images: `alt`, size,
  lazy below the fold. Icon-only buttons: `aria-label`. Headings at the right
  level for where the component sits (never a second `<h1>`).
- Website (TanStack Start): it renders on the server too — no `window`,
  `localStorage` or `document` during render; read them in an effect or an
  event handler.
- Non-trivial behaviour → colocated `<name>.test.tsx` with the project's
  render helper.
- Verify: `npm run typecheck && npm run lint`, then look at it in Arabic and
  English, phone and desktop, light and dark.
