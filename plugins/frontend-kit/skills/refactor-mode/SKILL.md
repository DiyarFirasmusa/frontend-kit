---
name: refactor-mode
description: Turn refactor mode on or off and run it — audit the project against the kit's standards, write a phased plan, then restructure phase by phase without changing behaviour. Run with /frontend-kit:refactor-mode.
argument-hint: "[on | off | status | audit | next]"
disable-model-invocation: true
---

# Refactor mode

Values written `<name>` below (`<defaultBranch>`, …) are this project's: read them from `.claude/frontend-kit.json`.

Refactor mode brings an existing project up to the standards in `.claude/rules/` (`structure.md`, `react.md`,
`naming.md`, `quality-bar.md`, `testing.md`, plus the profile's rules). While it is on, "no drive-by refactors"
(`scope.md`) is lifted **for the planned phases only**. Everything else still holds: branch per task, ask before
commit and push, the hooks, the gate.

## `on`

1. Read `.claude/frontend-kit.json`; stop if it is missing (run `/frontend-kit:setup` first).
2. Set `"mode": "refactor"` with `jq` (keep every other key), show the diff, write the file.
3. Say what comes next: `/frontend-kit:refactor-mode audit`.

## `off`

Set `"mode": "existing"` the same way. Unfinished phases stay in `docs/refactor-plan.md`.

## `status`

Print the mode and, from `docs/refactor-plan.md`, which phases are done, current and pending. Edit nothing.

## `audit` (read-only)

Create a task branch from `origin/<defaultBranch>` if you are on a protected one. Then measure, without editing code:

- **Safety net:** does the typecheck, lint and test suite pass today? Record the exact numbers. If the baseline is
  red, phase 1 is "make it green", nothing else starts before it.
- **Structure:** feature folders vs type folders, files over 500 lines, components over 200, sideways and circular
  imports, barrel files, dead exports and unused dependencies (`knip`/`ts-prune`/`depcheck` if installed, else grep).
- **Types:** `strict`, count of `any`, `@ts-ignore`, unchecked casts, untyped API responses.
- **Data and state:** direct `fetch`/axios in components, server data copied into state, missing loading/error/empty
  states, inconsistent query keys.
- **Forms and UI:** duplicated components, inline strings that should be i18n, physical CSS direction classes where the
  project supports RTL, missing labels, divs used as buttons.
- **Kit leftovers:** `kit-prune.sh <profile>` (dry run) lists rules from another profile; they go into phase 2.
- **Quality:** test coverage of the logic, flaky or skipped tests, `console.log`, TODOs, secrets in the repo.

Write `docs/refactor-plan.md`: findings with counts and example `file:line`, then **phases** ordered by risk:

1. Green baseline (fix the red gate; no restructuring).
2. Mechanical (format, lint autofix, import order, file renames, dead code removal, kit leftovers moved to `.claude/kit-backup/`).
3. Types (strict, remove `any`, type the API layer).
4. Structure (move to feature folders, split big files, extract hooks; move first, change nothing else).
5. Patterns (data layer, forms, state: one library, one way).
6. Quality (tests for the logic that moved, accessibility, i18n, performance budgets).

Each phase lists its files, the check that proves it done, and the rollback (it is one commit). Show the plan and
**wait for the user's OK**; they may drop or reorder phases.

## `next`

Run the first pending phase of the approved plan:

1. Confirm the gate is green before you touch anything.
2. Do **only** that phase. Move code and change structure; never change behaviour, copy, styles or APIs in the same
   step. If you find a bug, note it in the plan under "found, not fixed" and keep going.
3. Work in small steps; after each batch run the typecheck and the related tests. Use `fix-everywhere` for patterns.
4. At the end run `verify` and report the real numbers against the audit baseline: same tests passing, same
   typecheck result, fewer findings.
5. Mark the phase done in the plan, then **ask before commit and push** (one commit per phase, conventional
   message). Stop; the user starts the next phase.

## Rules while it is on

- Behaviour is frozen: a refactor that needs a behaviour change is a separate task.
- Never skip or delete a test to make a phase pass; never loosen a lint or type rule.
- A step that touches more than ~40 files or a risky area (auth, payments, routing guards) is split or asked first.
- Generated files, deploy config and `.env*` stay off limits (the hooks enforce it).
