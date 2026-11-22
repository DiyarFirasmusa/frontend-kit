# Testing the kit

Five layers. Run the cheap ones on every change and the paid ones when behaviour a model decides on changes.

| Layer | What it proves | Command | Costs money |
| ----- | -------------- | ------- | ----------- |
| Repo checks | JSON valid, versions consistent, skill and eval layout, examples complete | `bash scripts/validate-repo.sh` and `claude plugin validate . --strict` | no |
| Hook tests | every hook script and helper on throwaway git repos | `KIT_TEST_PROJECT=<project with node_modules> bash plugins/frontend-kit/scripts/test-hooks.sh` | no |
| Mode tests | the working modes: what each refuses and lets through, the silent default, the switch | `bash plugins/frontend-kit/scripts/mode-test.sh` | no |
| Evals | does Claude pick and follow the skills and agents | `bash scripts/eval.sh dev` (also `info`, `heldout`, `save`, `compare`) | yes |
| Benchmark | kit against bare on a real task, scored by the project's checks and a rubric judge | `bash scripts/e2e-bench.sh <project> <task.md> <kit\|bare> <out.jsonl>` | yes |

## Evals (`plugins/frontend-kit/evals/`)

Native `claude plugin eval` cases: `prompt.md` plus `graders/*.md`.

- `dev/`: tune against these. Trigger cases for every skill, quiet cases (no skill must fire), no-autofire cases for the
  user-only skills, explicit agent-quality cases, RTL / form / i18n output cases.
- `info/`: implicit agent delegation. Informational: when the code is in the prompt Claude answers inline.
- `heldout/`: run once at the end of a round. Never tune against it, or it stops being held out.
- A case that talks about code must contain the code: the eval workspace is empty, and Claude otherwise searches, finds
  nothing and gives up before it uses any skill.
- `tool_used` with `max: 0` also needs `min: 0`.

Workflow: run, `save`, change **one** thing, run, `compare`. Measure descriptions over 5 or more runs.

## Benchmark

`e2e-bench.sh` copies a project (node_modules symlinked), starts both arms on a task branch (the kit forbids editing on
`main`), runs `claude -p` with the same tools and project settings only, then scores with the project's typecheck, linter
and tests plus `bench-judge.sh` (nine yes/no criteria on the diff; the judge never sees the arm).

## Real sessions without a UI

`claude -p ... --plugin-dir plugins/frontend-kit --setting-sources project --strict-mcp-config` in a disposable copy
runs the real skills and hooks. Useful flags: `--include-hook-events --output-format stream-json --verbose` (hook outputs),
`--resume <id>` (a second turn, for approval steps), and a `--settings` JSON with an `InstructionsLoaded` hook to log which
rule files load for a file.

## What is still not covered

A full `new` path with a real scaffold, an interactive setup with open questions, live `git push --force`
(the model refuses it itself; the guard is unit tested), yarn, bun, Biome, Expo, large codebases.
Of the working modes: read-only, prototype and a real upgrade plan in a live session, a mode inside a subagent, and leaving
a mode where skill shell execution is off. No eval shows that a mode beats the default.

The guards need Claude Code 2.1.295 or later: earlier versions let a call through when a guard times out or cannot start.
