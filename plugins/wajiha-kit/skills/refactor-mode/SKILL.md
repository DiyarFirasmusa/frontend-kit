---
name: refactor-mode
description: Turn refactor mode on or off and run it — audit the project against the kit's standards, write a phased plan, then restructure phase by phase without changing behaviour. Run with /wajiha-kit:refactor-mode.
argument-hint: "[on [--days N] | off | status | audit | next]"
disable-model-invocation: true
allowed-tools: Bash("${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" *)
---

# Refactor mode

Values written `<name>` below (`<defaultBranch>`, …) are this project's: read them from `.claude/wajiha-kit.json`.

Refactor mode brings an existing project up to the standards in `.claude/rules/` (`structure.md`, `react.md`,
`naming.md`, `quality-bar.md`, `testing.md`, plus the profile's rules). While it is on, "no drive-by refactors"
(`scope.md`) is lifted **for the planned phases only**. Everything else still holds: branch per task, ask before
commit and push, the hooks, the gate. The rules fix how code is written and separated. Folders and libraries named in them
are examples: the target layout is the one the user picks, by default the project's own.

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" "${CLAUDE_PROJECT_DIR}" refactor <<'KIT_MODE_ARGS_${CLAUDE_SESSION_ID}'
$ARGUMENTS
KIT_MODE_ARGS_${CLAUDE_SESSION_ID}
```

## `on`, `off`, `status`

The line above is their result (the switch already ran; `/wajiha-kit:mode` is the same switch for every mode). Show it. After `on`
say what comes next: `/wajiha-kit:refactor-mode audit`. Never change the mode yourself, with a tool or by editing
`.claude/wajiha-kit.json`: only the user switches modes. `off` keeps unfinished phases in `docs/refactor-plan.md`.
For `status` also print from that plan which phases are done, current and pending, and edit nothing.
For `audit` and `next` the line says whether refactor mode is on: if it is not, say so and stop.

**What is enforced.** For the edit tools the mode guard blocks adding `.skip`/`.only`, shrinking a test file's cases, editing
a snapshot and adding a suppression comment to code (`@ts-ignore`, `eslint-disable`; the plan may name them). In the shell
it catches the common forms of deleting a test and updating snapshots: a guard rail, not a sandbox. Everything else here
(frozen behaviour, one phase at a time, the approved plan) is an instruction to you.

## `audit` (read-only)

Create a task branch from `origin/<defaultBranch>` if you are on a protected one. Then measure, without editing code:

- **Safety net:** does the typecheck, lint and test suite pass today? Record the exact numbers. If the baseline is
  red, phase 1 is "make it green", nothing else starts before it.
- **Structure:** the project's own layout and where code departs from it, mixed responsibilities (UI, state, data, pure
  logic), files over 500 lines, components over 200, sideways and circular
  imports, barrel files, dead exports and unused dependencies (`knip`/`ts-prune`/`depcheck` if installed, else grep).
- **Types:** `strict`, count of `any`, `@ts-ignore`, unchecked casts, untyped API responses.
- **Data and state:** direct `fetch`/axios in components, server data copied into state, missing loading/error/empty
  states, inconsistent query keys.
- **Forms and UI:** duplicated components, inline strings where the project has translations, physical CSS direction classes where the
  project supports RTL, missing labels, divs used as buttons.
- **Kit leftovers:** `kit-prune.sh <profile>` (dry run) lists rules from another profile; they go into phase 2.
- **Quality:** test coverage of the logic, flaky or skipped tests, `console.log`, TODOs, secrets in the repo.

- **Public surface (the frozen things):** record the routes and URLs, exports others import, network requests, storage keys,
  analytics events and i18n keys. They are compared again at the end of every phase.

Write `docs/refactor-plan.md`: findings with counts and example `file:line`, then **phases** ordered by risk:

0. Safety net: where the code to be moved has no test, pin what it does today (a characterization test, or a route-level or e2e
   test), in its own commit before the code moves, labelled "current behaviour, not verified correct". Show the user anything
   that looks like a bug instead of fixing or enshrining it.
1. Green baseline (fix the red gate; no restructuring).
2. Mechanical (format, lint autofix, import order, file renames, dead code removal, kit leftovers moved to `.claude/kit-backup/`).
3. Types (strict, remove `any`, type the API layer).
4. Structure (the layout the user picked, by default the project's own; feature folders are one example. One
   responsibility per file, split big files, extract logic; move first, change nothing else).
5. Patterns (data layer, forms, state: one way for each, by default the project's most used one).
6. Quality (more tests, accessibility, i18n, performance budgets).

Some steps cannot keep behaviour frozen: making a red baseline green, removing code that is used dynamically, hook-dependency
lint fixes, strictness fixes that add guards, swapping one data or form library for another, and accessibility, i18n or
performance work. Each of these is listed as a **behaviour change**, approved on its own, with how its equivalence or
difference is shown. A route file move changes a URL: it keeps the URL or needs an approved redirect map.

Each phase lists its files, the check that proves it done, and the rollback (it is one commit). Show the plan with the
target layout (by default: keep the project's own) and **wait for the user's OK**; they may pick another layout, drop or
reorder phases.

## `next`

Run the first pending phase of the approved plan:

1. Confirm the gate is green before you touch anything.
2. Do **only** that phase. Move code and change structure; never change behaviour, copy, styles or APIs in the same
   step. If you find a bug, note it in the plan under "found, not fixed" and keep going.
3. Work in small steps; after each batch run the typecheck and the related tests. Use `fix-everywhere` for patterns.
4. At the end run `verify` and report the real numbers against the audit baseline: same tests passing, same
   typecheck result, fewer findings.
5. Compare the public surface against the audit's record; any difference is reported, not shipped. At a phase end run the
   whole unit suite, the build and e2e, not only the related tests.
6. Mark the phase done in the plan, then **ask before commit and push** (one commit per phase, conventional
   message). Stop; the user starts the next phase.

## Leaving

When the plan is done (or dropped by the user): transitional code and shims removed, `/wajiha-kit:refactor-mode off`.
"Rollback is one commit" holds only while later phases do not depend on an earlier one; the plan says where they do.

## Rules while it is on

- Behaviour is frozen: a refactor that needs a behaviour change is a separate task.
- Never skip or delete a test to make a phase pass; never loosen a lint or type rule.
- A step that touches more than ~40 files or a risky area (auth, payments, routing guards) is split or asked first.
- Generated files, deploy config and `.env*` stay off limits (the hooks enforce it).
