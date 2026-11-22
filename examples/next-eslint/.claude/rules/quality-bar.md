# Quality bar

Code here is written to the standard of the best engineer on the team, not
the average one. Every change meets all of this; a change that doesn't isn't
finished. The Stop hook runs typecheck and related tests on every change.

## Who decides

What the user asked, then the project's own pattern (`project.md`, the nearest code of the same role), then the
framework's convention, then the kit's examples. Folder trees, file names and libraries in these rules are examples;
how code is split is not. The stack is what `package.json` and the code use (the profile name `react` doesn't mean
React). A new dependency needs the user's yes.

## Types (in a TypeScript project)

- Strict TypeScript with no escape hatches: no `any`, no `as` casts to silence
  the compiler, no `!` on values that can really be missing, no
  `@ts-ignore` / `@ts-expect-error`. Use `unknown` and narrow; let the types
  describe the real shape (generated API types are often optional by default).
- Model states as unions (`{ status: 'loading' } | { status: 'error'; … }`),
  not boolean soup. Make impossible states unrepresentable.

## Shape

- Small, focused files and functions: one reason to change each. View, state,
  data access and pure logic are apart: a view holds no request, storage or
  business calculation. Files stay well under 500 lines.
- Names that explain: a reader knows what a function returns and what a
  variable holds without opening it. No `data2`, `handleClick2`, `temp`, `x`.
- Follow the project's layout and file style (`CLAUDE.md`, `project.md`): code
  lives with its one owner, shared once a second feature uses it. Imports go
  one way, never into another feature's internals.
- Reuse before writing: check the shared folder and the sibling feature first.
- No dead code, commented-out code, `console.log` or TODO/FIXME left behind.
- Comments explain *why* (a constraint, a backend quirk, a trade-off), never *what*.

## Every UI change considers

- **States** — loading, error, empty and success, each designed, not an afterthought.
- **Accessibility** — semantic elements, labels, focus order and visible focus,
  keyboard, `aria-*` only where HTML has no answer, contrast in light and dark.
- **Languages and direction** — English only, LTR; logical properties only, so a second direction stays cheap.
- **Mobile first** — phone width first, then up; touch targets ≥ 44px; no layout shift.
- **Performance** — no needless re-renders or request waterfalls, images sized,
  routes stay split, subscriptions as small as the view needs.

## Proof

- Tests with every change (`.claude/rules/testing.md`): the logic you touched
  is unit-tested, a touched page covers its states plus one interaction. With no
  runner, use one built into the runtime or say so: never install one unasked.
- Before saying "done", the gates ran and passed (`verify` skill), and you say
  exactly what was and wasn't checked. Never claim a check you didn't run.

## Before you say "done" — check these five against your own diff

1. **Touch targets:** every button, link, input, checkbox and icon button is at least 44×44 px (`min-h-11 min-w-11`, or
   `min-height: 44px; min-width: 44px`; the WCAG minimum is 24). A 24px icon button gets padding, not a smaller hit area.
2. **No `any`, no casts (TypeScript):** grep your diff for `: any`, `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`. Use
   `unknown` and narrow, or fix the type.
3. **Logical direction only:** no `left`/`right`/`margin-left`/`padding-right`/`ml-`/`pr-`/`text-left`. Use `inset-inline-*`,
   `margin-inline-*`, `padding-inline-*`, `ms-`/`pe-`/`text-start`.
4. **Names and text:** every control has a visible label or `aria-label`; with i18n, no user-facing string is hardcoded and every language has it.
5. **Tests assert behaviour:** each new component or piece of logic has a test of what it does (clicks, states, edge cases), not only that it renders.
