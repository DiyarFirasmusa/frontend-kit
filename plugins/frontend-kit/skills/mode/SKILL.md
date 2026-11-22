---
name: mode
description: Turn a working mode on or off and see what is on — new, existing, maintenance, refactor, upgrade, freeze (project modes) and hotfix, read-only, prototype (this checkout only). Each mode changes what Claude may do; the guard blocks what a hook can see and the rest is instruction. Run with /frontend-kit:mode.
argument-hint: "[status | list | off [mode|all] | <mode> [--days N | --until DATE] [--base REF] [--files N] [--note why]]"
disable-model-invocation: true
allowed-tools: Bash("${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" *)
---

# Working modes

The switch has already run; its result is here:

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/mode-switch.sh" "${CLAUDE_PROJECT_DIR}" <<'KIT_MODE_ARGS_7F3A'
$ARGUMENTS
KIT_MODE_ARGS_7F3A
```

Show the user that result as it is (a few lines), then follow the rules it printed for the mode that is now on. Do not
change the mode yourself, with a tool or by editing `.claude/frontend-kit.json` or `.claude/state/`: only the user
switches modes, and the mode guard refuses it. If the result is a question or an error, relay it and stop.

What is true of every mode: git, live-site, secrets and deploy-config guards stay exactly as they are; a mode only adds
blocks, never lifts one. "Enforced" lines are checked by a hook (a guard rail like the git guard, not a sandbox: scripts
and other programs are not looked into); everything else is an instruction to you.

After a mode was turned **on**, start like this (skip when the result is only a status, a list or an "off"):

- `new`: ask what the first walking skeleton is (one route through data, UI, test and build), then build it.
- `existing`: nothing to do; say that the project's own patterns win.
- `maintenance`: ask what must be kept running and until when (`--note`); start nothing else.
- `refactor`: run `/frontend-kit:refactor-mode audit` next. `upgrade`: `/frontend-kit:upgrade-mode plan` next.
- `freeze`: ask for the end date if none was given and what the release is. List what you would do after the freeze only if asked.
- `hotfix`: ask for the deployed ref (release tag or branch) if `--base` is missing and for the incident in one line. Offer
  a revert or a flag-off before a forward fix. Cut the fix branch from that ref (`git fetch origin --tags`, then
  `git checkout -b fix/<name> <ref>`); the protected-branch and no-push guards still apply. Write the regression test first
  and show that it fails. At the end say how the fix reaches `<defaultBranch>`.
- `read-only`: ask what is being assessed. Findings go in `docs/audits/<date>-<topic>.md` (the one place that may be
  written), each with severity, `file:line`, evidence and what was not verified. The "Audit report" output style fits.
  The gates are not run in this mode (that would run project code): say which numbers are missing.
- `prototype`: ask for the one question the prototype answers; work in `prototypes/<name>/` with made-up data and finish
  with what it proved, what it skipped and what to rebuild.

To go back: `/frontend-kit:mode off` (the narrowest mode first). Unfinished plans stay on disk.
