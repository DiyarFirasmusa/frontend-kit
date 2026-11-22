---
name: upgrade-mode
description: Move one dependency family to a new version in approved phases — preflight, a plan from the official guides, the bridge release, codemod-only commit, the family bump, manual fixes, the silent-change checklist. Turns upgrade mode on or off. Run with /frontend-kit:upgrade-mode.
argument-hint: "[on | off | status | plan | next]"
disable-model-invocation: true
allowed-tools: Bash("${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" *)
---

# Upgrade mode

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" "${CLAUDE_PROJECT_DIR}" upgrade <<'KIT_MODE_ARGS_7F3A'
$ARGUMENTS
KIT_MODE_ARGS_7F3A
```

Values written `<name>` are this project's: read them from `.claude/frontend-kit.json`. The mode switch result is above for
`on`, `off` and `status`; `plan` and `next` need upgrade mode to be on (`/frontend-kit:upgrade-mode on`): if it is not, say so and stop.
Never change the mode yourself.

A major upgrade is not a refactor and not a feature: dependencies change, behaviour is meant to stay. Agents fail here in a
known way (the API is migrated, the tests still fail, or a failing test is deleted), so the proof is the whole suite, not
the typecheck. `references.md` next to this file lists the official guides and their silent changes.

## `plan` (read-only until the user approves)

1. Name the family and the target in one line (`react 18 → 19` with `@types/*`; `next 15 → 16` with react). Ask when unclear.
   A patch or single-package bump needs no plan: do it as a normal task.
2. Branch from `origin/<defaultBranch>`. Record the baseline with real numbers: typecheck, lint, the whole unit suite (not
   only related tests), build, e2e, bundle size, and screenshots or the pages that matter. A red baseline is phase 0 of its own.
3. Floors: Node, TypeScript and browser support against the target's minimums. A project that must support an older browser
   or runtime than the target allows stops here and tells the user.
4. Read the official guide of **every major crossed** (links in `references.md`; open them, do not work from memory) and any
   migration skill the vendor ships. Use the vendor's codemod and upgrade command; do not re-implement them. Show a command that
   downloads and runs code before you run it, and run it only after the user says yes.
5. Write `docs/upgrade-plan.md`: baseline numbers, floors, the guide's order as phases, the silent-change checklist for this
   project (which of them can this code even hit), and per phase the check that proves it. Wait for the user's OK.

Default phases: (1) bridge release and clearing its deprecation warnings; (2) codemods only, committed alone; (3) the whole
family bumped together (framework, react, react-dom, their types, the lint config only if the framework requires it);
(4) manual fixes; (5) the silent-change checklist, each item looked for in this code; (6) compatibility shims and codemod
markers removed. Optional adoptions the guide offers (a compiler, new caching) are a later campaign, never part of this one.

## `next`

Do only the first pending phase; the gate is green before you touch anything. Rules while it is on:

- No `--force` or `--legacy-peer-deps` (the mode guard blocks them); a peer conflict is solved or reported.
- No deleted or skipped test, no refreshed snapshot, no new suppression comment (the mode guard blocks them); a test that
  fails after the upgrade is a finding for the user.
- No new feature and no cleanup. A bug found on the way goes in the plan as "found, not fixed".
- End of phase: the real numbers against the baseline (same tests passing, same test count), build and e2e too. Mark the
  phase done, then ask before commit and push (one commit per phase). Stop; the user starts the next phase.

## Done

Whole suite, build and e2e green, no use of a removed API (grep), no codemod marker left or each tracked, one installed copy of
react, the plan's checklist answered, screenshots reviewed. Then `/frontend-kit:upgrade-mode off`.
