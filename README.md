# frontend-kit

A Claude Code marketplace with one plugin, `frontend-kit`, for frontends in any stack (React + TypeScript first-class). It gives a project the
conventions, workflows and guard rails a good frontend team would write down, and enforces the ones that can be enforced.

| What | Count |
| ---- | ----- |
| Skills (create a component, form, table, route, store, hook; verify, review, refactor, commit, modes, ...) | 41 |
| Agents (reviewer, bug hunter, security, SEO and accessibility auditors, planner, test engineer, ...) | 14 |
| Hooks (guards, format + lint on edit, quality gate, code review, skill suggestions) | 10 events |
| Project profiles | `website`, `dashboard` (Vite, Next.js or TanStack Start), `react` (any stack), `fullstack` (site + admin in one tree) |

## Install

```text
/plugin marketplace add DiyarFirasmusa/frontend-kit
/plugin install frontend-kit@frontend-kit
/frontend-kit:setup
```

Restart Claude Code after setup. Requirements: `jq`, Node 20+, git. The guards need Claude Code 2.1.295 or later: earlier
versions let a call through when a guard times out or cannot start.

`/frontend-kit:setup` asks what you are doing (new project, existing project, maintenance, refactor) and what kind of project it is,
detects the stack (package manager, framework, router, tests, linter, formatter, i18n, source folders), shows **one proposal**
and waits for your yes, then writes `CLAUDE.md`, `.claude/rules/`, `.claude/settings.json` and `.claude/frontend-kit.json`,
adapted to what it found.

**Updates don't always arrive by themselves.** Setup turns on `autoUpdate` for the kit's marketplace, but Claude Code
updates plugins only in interactive sessions, and not at all where `DISABLE_AUTOUPDATER`, `DISABLE_UPDATES` or
`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` is set (the Claude desktop app sets the first), unless
`FORCE_AUTOUPDATE_PLUGINS=1` is too. To update by hand, in the project's folder (both commands: the first alone refreshes
only the list), then restart Claude Code and run `/frontend-kit:setup` again for template changes:

```bash
claude plugin marketplace update frontend-kit && claude plugin update frontend-kit@frontend-kit
```

## What it enforces

- No commit, merge or push on protected branches; no force push, `--no-verify`, `reset --hard`; no PR opened by Claude (it prints the compare link).
- No requests to live hosts; no reading `.env*`; no edits to deploy config, lockfiles or generated files.
- After each edit: format and lint with the project's own tools, and a warning for `any`, unsafe casts and `@ts-ignore`.
- When Claude stops: typecheck and related tests (and the i18n validator) on the session's changes, committed or not, then one code
  review by `frontend-reviewer`.
- It names the skills that fit each prompt, in English or Arabic (standard, Iraqi, or English words in Arabic letters).

The guards are a guard rail, not a sandbox: they read shell commands the way the shell does, but not what a script file, a
package script or a program in another language does. Keep branch protection on.

## Working modes

`/frontend-kit:mode <name>` turns one on: `maintenance`, `refactor`, `upgrade`, `freeze` for the project, `hotfix`,
`read-only`, `prototype` for this checkout. `status` shows what is on and what is enforced, `off` leaves it. A project in
the default mode (`existing`) or without a config gets no extra rule or refusal. The mode guard holds the edit tools; in
the shell it catches common forms only.

## Refactor mode

`/frontend-kit:refactor-mode audit` measures a project against the standards, writes a phased plan, and `next` carries out one
phase at a time with behaviour frozen and the gate green in between. See [`examples/refactor-legacy`](examples/refactor-legacy).

## Where to look

| | |
| - | - |
| [`examples/`](examples) | 7 projects showing what setup produces on different stacks |
| [`plugins/frontend-kit/README.md`](plugins/frontend-kit/README.md) | the plugin in detail |
| [`docs/`](docs) | development guide, testing, template contract |
| [`CHANGELOG.md`](CHANGELOG.md) | what changed in each version |

Measured so far: on two small tasks in a Vite project, code written with the kit scored 90/90 on a nine-point rubric against
81/90 without it, at about 1.5 times the cost; at 1.14.0, 60 of the then 62 passed (average score 97.1%). The suite now has a total of 66 development evals; the four newest have not been run.
Small samples from one project: a direction, not proof.

Third-party skills and their licences: [`plugins/frontend-kit/THIRD_PARTY_NOTICES.md`](plugins/frontend-kit/THIRD_PARTY_NOTICES.md).
