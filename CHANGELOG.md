# Changelog

Versions are the `version` in `plugins/frontend-kit/.claude-plugin/plugin.json`. A project only receives an update when
that number changes.

## 1.11.0
- The `dashboard` profile now runs on three frameworks, chosen in `/frontend-kit:setup` (question 2b): Vite + TanStack Router
  (as before), TanStack Start in SPA mode, or Next.js (App Router). The variants live in
  `templates/dashboard/variants/<variant>/` and replace only the router-bound parts (`CLAUDE.md`, `routing.md`,
  `error-monitoring.md`, a `framework.md` for Start, and the `stack` / `generatedPaths` config). Tables, forms, permissions, the API
  layer and the `dash-*` skills are shared.
- `dash-create-route` has a Next.js reference (`references/next-routes.md`): thin pages, `proxy.ts` + layout guards,
  zod over `useSearchParams` with a `useListSearch` helper, no loaders.
- `validate-repo.sh` checks every variant (150-line cap, config, rule frontmatter, mentioned in the setup skill).

## 1.10.0
- `examples/`: seven reference projects (three from real runs of the skills, four generated with the detection script).
- The package manager is read from `package.json` (`packageManager`) when there is no lockfile.
- `/frontend-kit:setup` writes `.claude/frontend-kit.json` first and stops when Claude Code refuses a write in `.claude/`,
  so unadapted rule files are never left behind; running it again finishes the job.
- Repository tidy-up: this changelog, `docs/TESTING.md`, a docs index, a rewritten README, example checks in `validate-repo.sh` and CI.

## 1.9.0
- Monorepos: `kit-detect-stack.sh` reads pnpm/npm/yarn workspaces and lists the packages as `apps` (with `cwd`); the Stop
  gate runs an app's related tests inside its package.
- `kit-scope-rules.sh` also moves the paths written in a rule's text, not only its `paths:` globs.
- Setup no longer claims that denied skills disappear from Claude's list (they are blocked, not hidden; verified).
- First end-to-end run with real Claude sessions: setup (react, fullstack, refactor, new), scoped rule loading, deny rules, live hooks.

## 1.8.0
- The `frontend-status` plugin was removed from the marketplace (not a target of the kit).

## 1.7.1
- `quality-bar.md` ends with a five-point "before you say done" checklist; `post-edit.sh` warns on `any`, `as any`,
  `as unknown as` and `@ts-ignore` without needing a linter.
- Benchmark: rubric 90/90 with the kit against 81/90 without; heldout evals 98%.

## 1.7.0
- Evals for every skill (trigger cases), quiet and no-autofire cases, explicit agent-quality cases; `scripts/e2e-bench.sh` and
  `scripts/bench-judge.sh` (kit against bare, scored by the project's checks and a rubric judge).
- Skill descriptions tuned by measurement (`create-component`, `create-store`, `create-hook`, `task`).
- A solution-style `tsconfig.json` is checked with `tsc -b`; source folders are detected when `srcDirs` is not set;
  `kit-detect-stack.sh`.

## 1.6.x
- `fullstack` profile and `apps` in `frontend-kit.json` (a site and an admin in one tree): per-app commands, scoped rules
  (`kit-scope-rules.sh`), skills of both apps stay available. (1.6.0)
- `kit-package-scripts.sh` adds only the scripts the project's own tools support; an `AGENTS.md` is imported, not copied. (1.6.1)

## 1.5.0
- Setup sends one proposal and waits for approval before writing; `kit-prune.sh` moves another profile's rules to
  `.claude/kit-backup/`; settings templates deny the other profile's skills with `Skill(frontend-kit:<name>)`.

## 1.4.0
- Stack-neutral `react` profile; setup asks "new / existing / refactor", then the kind of project; stack detection; hooks work with
  oxlint/eslint/biome, oxfmt/prettier/biome, vitest/jest and any source folder; `refactor-mode` skill.

## 1.3.0
- After a passing Stop gate, one code review by the `frontend-reviewer` agent (Opus). `claude plugin eval` cases for RTL.

## 1.2.x
- `skill-suggest` (names the skills that fit each prompt), `commit-gate`, `stopGate.tests: "all"`, settings templates declare
  the marketplace with `autoUpdate`; plan mode points at a personal `/spec` skill (1.2.1).

## 1.1.x
- Fixes from the first bench (mock API, website, dashboard): wrong facts in rules, hook false positives (oxlint "no files",
  ar/en parity mid-edit), shipped `validate-i18n.ts`, theme and lint baselines, new rules and skills; repo checks and CI.

## 1.0.0
- First marketplace: the `frontend-kit` plugin (skills, agents, hooks, templates) and `/frontend-kit:setup`.
