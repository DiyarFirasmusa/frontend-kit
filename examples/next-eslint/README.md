# next-eslint

Next.js, existing project, `react` profile.

A fresh `create-next-app` project (Next.js 16, App Router, ESLint 9, Tailwind 4, npm, no tests) after a real run of
`/wajiha-kit:setup`.

## What setup decided
- **Stack found:** no data layer, no test runner, no formatter, one LTR language, an `AGENTS.md` written by Next.js.
- **Dropped:** `rtl.md` and `i18n.md` (nothing to apply them to) and every allow rule for tools the project lacks (Vitest, oxlint, oxfmt, Playwright).
- **Not invented:** `package.json` scripts for tools that are not installed. The helper `kit-package-scripts.sh` only adds what exists.
- **Imported, not copied:** `AGENTS.md` through `@AGENTS.md` at the top of `CLAUDE.md`.
- **Reported:** "no test runner found", with Vitest suggested and not installed.
- **Rewritten:** `react.md` and `data-and-state.md` name the Next.js App Router and server components instead of TanStack.

Read `CLAUDE.md`, `.claude/wajiha-kit.json` and `.claude/rules/react.md` first.

Back to the [examples index](../README.md).
