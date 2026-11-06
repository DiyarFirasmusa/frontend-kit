# Quality bar

Code here is written to the standard of the best engineer on the team, not
the average one. Every change meets all of this; a change that doesn't isn't
finished. The Stop hook runs typecheck and related tests on every change.

## Types

- Strict TypeScript with no escape hatches: no `any`, no `as` casts to silence
  the compiler, no `!` on values that can really be missing, no
  `@ts-ignore` / `@ts-expect-error`. Use `unknown` and narrow; let the types
  describe the real shape (generated API types are often optional by default).
- Model states as unions (`{ status: 'loading' } | { status: 'error'; … }`),
  not boolean soup. Make impossible states unrepresentable.

## Shape

- Small, focused files and functions: one reason to change each. A route
  component is JSX plus one page hook; logic lives in hooks, utils and
  services. Files stay well under the 500-line lint cap.
- Names that explain: a reader knows what a function returns and what a
  variable holds without opening it. No `data2`, `handleClick2`, `temp`, `x`.
- Follow the layout in `CLAUDE.md`: the deepest folder that contains every
  importer, imports go up never sideways, no barrels, kebab-case.
- Reuse before writing: check the shared folder and the sibling feature first.
- No dead code, commented-out code, `console.log` or TODO/FIXME left behind.
- Comments explain *why* (a constraint, a backend quirk, a trade-off), never *what*.

## Every UI change considers

- **States** — loading, error, empty and success, each designed, not an afterthought.
- **Accessibility** — semantic elements, labels, focus order and visible focus,
  keyboard, `aria-*` only where HTML has no answer, contrast in light and dark.
- **Direction** — Arabic RTL and English LTR, logical properties only.
- **Mobile first** — phone width first, then up; touch targets ≥ 44px; no layout shift.
- **Performance** — no needless re-renders or request waterfalls, images sized,
  routes stay split, no whole-store subscriptions.

## Proof

- Tests with every change (`.claude/rules/testing.md`): the logic you touched
  is unit-tested, a touched route component covers its states plus one interaction.
- Before saying "done", the gates ran and passed (`verify` skill), and you say
  exactly what was and wasn't checked. Never claim a check you didn't run.
