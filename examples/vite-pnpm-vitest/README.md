# vite-pnpm-vitest

Vite + React + TypeScript on pnpm, `react` profile.

A `create-vite` project (pnpm, Vitest, Prettier, oxlint) with the kit applied.

- `tsconfig.json` is a **solution file** (`references`, no files). `tsc --noEmit` on it checks nothing and passes, so the kit runs
  `tsc -b` (`commands.typecheck`). This was found by running the gate on a fresh Vite project.
- Package manager commands are `pnpm ...`; related tests run through `pnpm exec vitest related --run`.
- Prettier formats each edited file; oxlint lints it.

Back to the [examples index](../README.md).
