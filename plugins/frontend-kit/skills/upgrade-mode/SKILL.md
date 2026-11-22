---
name: upgrade-mode
description: Move one dependency family to a new version in approved phases — preflight, a plan from the official guides, the bridge release, codemod-only commit, the family bump, manual fixes, the silent-change checklist. Turns upgrade mode on or off. Run with /frontend-kit:upgrade-mode.
argument-hint: "[on [--days N] | off | status | plan | next]"
disable-model-invocation: true
allowed-tools: Bash("${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" *)
---

# Upgrade mode

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" "${CLAUDE_PROJECT_DIR}" upgrade <<'KIT_MODE_ARGS_${CLAUDE_SESSION_ID}'
$ARGUMENTS
KIT_MODE_ARGS_${CLAUDE_SESSION_ID}
```

Values written `<name>` are this project's: read them from `.claude/frontend-kit.json`. The mode switch result is above for
`on`, `off` and `status`; `plan` and `next` need upgrade mode to be on (`/frontend-kit:upgrade-mode on`): if it is not, say so and stop.
Never change the mode yourself.

A major upgrade is not a refactor and not a feature: dependencies change, behaviour is meant to stay. Agents fail here in a
known way (the API is migrated, the tests still fail, or a failing test is deleted), so the proof is the whole suite, not
the typecheck. `references.md` next to this file lists the official guides and their silent changes.

## `plan` (read-only until the user approves)

1. Name the family and the target in one line: the framework and the packages its guide says move with it (for example
   `react 18 → 19` with `@types/*`, `vue 2 → 3` with its router and store). Ask when unclear.
   A patch or single-package bump needs no plan: do it as a normal task.
2. Branch from `origin/<defaultBranch>`. Record the baseline with real numbers: typecheck, lint, the whole unit suite (not
   only related tests), build, e2e, bundle size, and screenshots or the pages that matter. A red baseline is phase 0 of its own.
3. Floors: Node, TypeScript and browser support against the target's minimums. A project that must support an older browser
   or runtime than the target allows stops here and tells the user.
4. Read the official guide of **every major crossed** (links in `references.md`; open them, do not work from memory) and any
   migration skill the vendor ships. Use the vendor's codemod and upgrade command; do not re-implement them. Show a command that
   downloads and runs code before you run it, and run it only after the user says yes. Delegate the reading and the mapping
   to the `upgrade-analyst` agent: its table goes into the plan, with the phases in the guide's order.
5. Write `docs/upgrade-plan.md`: baseline numbers, floors, the guide's order as phases, the silent-change checklist for this
   project (which of them can this code even hit), and per phase the check that proves it. Wait for the user's OK.

Default phases: (1) bridge release and clearing its deprecation warnings; (2) codemods only, committed alone; (3) the whole
family bumped together (the framework and what its guide moves with it, e.g. react, react-dom and their types; the lint
config only if the framework requires it);
(4) manual fixes; (5) the silent-change checklist, each item looked for in this code; (6) compatibility shims and codemod
markers removed. Optional adoptions the guide offers (a compiler, new caching) are a later campaign, never part of this one.

## `next`

Do only the first pending phase; the gate is green before you touch anything. Rules while it is on:

- No `--force` or `--legacy-peer-deps` (the mode guard catches the common forms); a peer conflict is solved or reported.
- No deleted or skipped test, no refreshed snapshot, no new suppression comment in code. The mode guard holds the edits and
  catches common shell forms only, so the rest is on you; a test that fails after the upgrade is a finding for the user.
- The Stop gate does not see a change of only package.json, the lockfile or a config: run `verify`, the build and e2e
  yourself before a phase is called done.
- No new feature and no cleanup. A bug found on the way goes in the plan as "found, not fixed".
- End of phase: the real numbers against the baseline (same tests passing, same test count), build and e2e too. Mark the
  phase done, then ask before commit and push (one commit per phase). Stop; the user starts the next phase.

## Done

Whole suite, build and e2e green, no use of a removed API (grep), no codemod marker left or each tracked, one installed copy of
each framework runtime, the plan's checklist answered, screenshots reviewed. Then `/frontend-kit:upgrade-mode off`.
