# Examples

Seven small projects that show what `/frontend-kit:setup` produces and how the kit adapts to the stack it finds.
They are references to read, not apps to ship. Nothing here is installed by the plugin.

| Example | Stack | Mode and profile | Origin | What to look at |
| ------- | ----- | ---------------- | ------ | --------------- |
| [`next-eslint`](next-eslint) | Next.js 16 (App Router), ESLint 9, Tailwind 4, npm, no tests | existing / `react` | **real setup run** | `rtl.md` and `i18n.md` dropped (one LTR language), no oxlint/vitest scripts invented, `@AGENTS.md` imported |
| [`fullstack-site-admin`](fullstack-site-admin) | TanStack Start site + admin under `src/admin` | existing / `fullstack` | **real setup run** | `admin-*` rules scoped to `src/admin` and `src/routes/admin`, per-app commands in `apps` |
| [`refactor-legacy`](refactor-legacy) | Vite, mixed JS/TS, axios, no tests | refactor / `react` | **real `refactor-mode audit`** | `docs/refactor-plan.md`: baseline, findings with `file:line`, phases, bugs found but not fixed |
| [`vite-pnpm-vitest`](vite-pnpm-vitest) | Vite + React + TS, pnpm, Vitest, Prettier, oxlint | existing / `react` | generated with `kit-detect-stack` | `tsc -b` for a solution-style `tsconfig.json`, pnpm commands |
| [`react-router-app-dir`](react-router-app-dir) | React Router v7 framework mode, code in `app/` | existing / `react` | generated | `srcDirs: ["app"]`, the project's own `typecheck` script |
| [`jest-eslint-prettier`](jest-eslint-prettier) | Vite, Jest, ESLint, Prettier, Redux Toolkit, MUI | existing / `react` | generated | `jest --findRelatedTests`, ESLint + Prettier on every edit |
| [`pnpm-monorepo`](pnpm-monorepo) | pnpm workspace: `apps/web`, `packages/ui` | existing / `react` | generated | `apps` with `cwd` per package, related tests run inside the package |

"Real setup run" means a headless Claude Code session ran the skill end to end on a copy of the project (answers given in
the prompt, approval step honoured). "Generated" means `scripts/kit-detect-stack.sh` and the `react` template produced the
files; the rules folder is left out there because it is the template with the stack-specific sentences adapted.

## Try one on your machine

```bash
cd examples/next-eslint
claude --plugin-dir ../../plugins/frontend-kit
```

Then ask for a small change (a component, a form) and watch the hooks: format and lint after each edit, the quality gate
when Claude stops, one code review by `frontend-reviewer`. To see detection on any folder:

```bash
plugins/frontend-kit/scripts/kit-detect-stack.sh examples/pnpm-monorepo | jq
```

## Keeping them honest

`bash scripts/validate-repo.sh` checks every example: a README, valid JSON, no unreplaced placeholder left, no absolute paths,
and (for examples with a `package.json`) that `kit-detect-stack.sh` still finds the `srcDirs` the example's config lists.
