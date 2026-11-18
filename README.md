# frontend-kit

A Claude Code marketplace with one plugin, `frontend-kit`, for React + TypeScript frontends. It gives a project the
conventions, workflows and guard rails a good frontend team would write down, and enforces the ones that can be enforced.

| What | Count |
| ---- | ----- |
| Skills (create a component, form, table, route, store, hook; verify, review, refactor, commit, ...) | 38 |
| Agents (reviewer, bug hunter, accessibility auditor, planner, test engineer, ...) | 10 |
| Hooks (guards, format + lint on edit, quality gate, code review, skill suggestions) | 11 events |
| Project profiles | `website`, `dashboard`, `react` (any stack), `fullstack` (site + admin in one tree) |

## Install

```text
/plugin marketplace add DiyarFirasmusa/frontend-kit
/plugin install frontend-kit@frontend-kit
/frontend-kit:setup
```

Restart Claude Code after setup. Requirements: `jq`, Node 20+, git.

`/frontend-kit:setup` asks what you are doing (new project, existing project, refactor) and what kind of React project it is,
detects the stack (package manager, framework, router, tests, linter, formatter, i18n, source folders), shows **one proposal**
and waits for your yes, then writes `CLAUDE.md`, `.claude/rules/`, `.claude/settings.json` and `.claude/frontend-kit.json`,
adapted to what it found. Projects set up this way update the plugin on their own (`autoUpdate`).

## What it enforces

- No commit, merge or push on protected branches; no force push, `--no-verify`, `reset --hard`; no PR opened by Claude (it prints the compare link).
- No requests to live hosts; no reading `.env*`; no edits to deploy config, lockfiles or generated files.
- After each edit: format and lint with the project's own tools, and a warning for `any`, unsafe casts and `@ts-ignore`.
- When Claude stops: typecheck and related tests (and the i18n validator), then one code review by `frontend-reviewer`.
- It names the skills that fit each prompt.

## Refactor mode

`/frontend-kit:refactor-mode audit` measures a project against the standards, writes a phased plan, and `next` carries out one
phase at a time with behaviour frozen and the gate green in between. See [`examples/refactor-legacy`](examples/refactor-legacy).

## Where to look

| | |
| - | - |
| [`examples/`](examples) | seven projects showing what setup produces on different stacks |
| [`plugins/frontend-kit/README.md`](plugins/frontend-kit/README.md) | the plugin in detail |
| [`docs/`](docs) | development guide, testing, template contract |
| [`CHANGELOG.md`](CHANGELOG.md) | what changed in each version |

Measured so far: on two small tasks in a Vite project, code written with the kit scored 90/90 on a nine-point rubric against
81/90 without it, at about 1.5 times the cost; 62 development evals pass at 98%. Small samples from one project: a direction, not proof.

Third-party skills and their licences: [`plugins/frontend-kit/THIRD_PARTY_NOTICES.md`](plugins/frontend-kit/THIRD_PARTY_NOTICES.md).
