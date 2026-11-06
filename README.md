# frontend-kit

A Claude Code marketplace with one plugin for React + TypeScript frontends, plus an optional status band.

| Plugin | What it gives a project |
| ------ | ----------------------- |
| `frontend-kit` | Skills, agents, hooks (git + live-site + secrets guards, format/lint on edit, quality gates), MCP servers (Chrome DevTools, Playwright, context7), and `/frontend-kit:setup`, which installs `CLAUDE.md`, `.claude/rules/`, `.claude/settings.json` and `.claude/frontend-kit.json` |
| `frontend-status` | Optional band above the prompt: branch, changes, ahead/behind, last gate, dev server |

Two profiles, chosen at setup:

- **website** — TanStack Start (SSR, file routes, server functions), TanStack Query, Tailwind v4, i18next (Arabic RTL + English).
- **dashboard** — Vite + React SPA, TanStack Router + Query + Table, Tailwind v4, i18next RTL, Sentry.

Both: TypeScript strict, react-hook-form + zod, Zustand, Vitest + MSW, Playwright + axe, oxlint + oxfmt, npm.

## Install in a project

```text
/plugin marketplace add /path/to/frontend-kit        # or owner/repo once it is on GitHub
/plugin install frontend-kit@frontend-kit
/frontend-kit:setup                               # asks the profile and the project values
/plugin install frontend-status@frontend-kit         # optional
```

Restart Claude Code after setup. Requirements: `jq` (`brew install jq`), Node 20+, git.

## What the hooks enforce

Values come from the project's `.claude/frontend-kit.json` (written by setup):

- No commit, merge or push on protected branches; no force push, `--no-verify`, `reset --hard`, `clean -f`.
- No PR opened or merged by Claude; it prints the compare link instead.
- No request, test or browser visit to the live hosts.
- No reading `.env*` secrets (`.env.example` is fine); no edits to deploy config or generated files.
- Format + lint every edited file; typecheck + related tests before Claude finishes a turn; typecheck before a
  coding agent reports back.
- Desktop alert when Claude waits for you; a log of failed tools; session clean-up.

Self-test: `KIT_TEST_PROJECT=/path/to/project bash plugins/frontend-kit/scripts/test-hooks.sh`.

## Update

Bump `version` in `plugins/frontend-kit/.claude-plugin/plugin.json` (and the marketplace entry), then in each
project: `/plugin marketplace update frontend-kit`. Re-run `/frontend-kit:setup` to pull template changes; it
shows a diff before touching existing files.

Third-party skills and their licences: `plugins/frontend-kit/THIRD_PARTY_NOTICES.md`.
