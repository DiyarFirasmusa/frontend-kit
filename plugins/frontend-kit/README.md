# frontend-kit

A Claude Code marketplace with one plugin for React + TypeScript frontends.

| Plugin | What it gives a project |
| ------ | ----------------------- |
| `frontend-kit` | Skills, agents, hooks (git + live-site + secrets guards, format/lint on edit, quality gates), MCP servers (Chrome DevTools, Playwright, context7), and `/frontend-kit:setup`, which installs `CLAUDE.md`, `.claude/rules/`, `.claude/settings.json` and `.claude/frontend-kit.json` |

`/frontend-kit:setup` asks two things first, and you answer both:

1. **What are we doing?** A new project, an existing project, or a refactor (restructure it to the standards).
2. **What kind of React project?** `website` (TanStack Start, SSR/SEO), `dashboard` (TanStack Table/Query + permissions, on Vite + TanStack Router, TanStack Start (SPA mode) or Next.js: you pick the framework),
   **both in one project** (`fullstack`: a site and an admin in one tree, each app with its own rules, skills and checks),
   or **any other React app** (`react`: Next.js, Remix, React Router, CRA, Expo web, …).

It then detects the stack (package manager, framework, router, data layer, styling, tests, linter, formatter, i18n,
source folders) and adapts the copied rules, permissions and hook commands to it. The hooks work with oxlint, eslint
or biome, oxfmt, prettier or biome, vitest or jest, and any source folder layout.

**Refactor mode** (`/frontend-kit:refactor-mode`): audit the project against the kit's standards, write a phased plan
you approve, then restructure one phase at a time with behaviour frozen and the gate green between phases.

## Install in a project

```text
/plugin marketplace add /path/to/frontend-kit        # or owner/repo once it is on GitHub
/plugin install frontend-kit@frontend-kit
/frontend-kit:setup                               # asks the profile and the project values
```

Restart Claude Code after setup. Requirements: `jq` (`brew install jq`), Node 20+, git.

## What the hooks enforce

Values come from the project's `.claude/frontend-kit.json` (written by setup):

- No commit, merge or push on protected branches; no force push, `--no-verify`, `reset --hard`, `clean -f`.
- No PR opened or merged by Claude; it prints the compare link instead.
- No request, test or browser visit to the live hosts.
- No reading `.env*` secrets (`.env.example` is fine); no edits to deploy config or generated files.
- Format + lint every edited file (with the project's own tools); typecheck + related tests before Claude finishes a turn; typecheck before a
  coding agent reports back.
- After a passing gate, one code review by the `frontend-reviewer` agent (Opus; `stopGate.review: false` turns it off).
- Names the skills that fit each prompt (`skill-suggest`); warns before a `git commit` that has not passed the gate.
- Desktop alert when Claude waits for you; a log of failed tools; session clean-up.

Self-test: `KIT_TEST_PROJECT=/path/to/project bash scripts/test-hooks.sh`.

## Update

Bump `version` in `.claude-plugin/plugin.json` (and the marketplace entry), then in each
project: `/plugin marketplace update frontend-kit`. Re-run `/frontend-kit:setup` to pull template changes; it
shows a diff before touching existing files.

Third-party skills and their licences: `THIRD_PARTY_NOTICES.md`.
