# pnpm-monorepo

A pnpm workspace.

`apps/web` and `packages/ui`. `kit-detect-stack.sh` reads `pnpm-workspace.yaml`, lists the packages as `apps` (with `cwd`),
and lists their `src` folders as `srcDirs`. The quality gate then runs an app's related tests inside that package, with paths
relative to it, and the typecheck once from the root (`pnpm run typecheck`).

Back to the [examples index](../README.md).
