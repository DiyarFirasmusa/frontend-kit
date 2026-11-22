# frontend-kit

A Claude Code marketplace with one plugin for React + TypeScript frontends.

| Plugin | What it gives a project |
| ------ | ----------------------- |
| `frontend-kit` | Skills, agents, hooks (git + live-site + secrets guards, format/lint on edit, quality gates), MCP servers (Chrome DevTools, Playwright, context7), and `/frontend-kit:setup`, which installs `CLAUDE.md`, `.claude/rules/`, `.claude/settings.json` and `.claude/frontend-kit.json` |

`/frontend-kit:setup` asks two things first, and you answer both:

1. **What are we doing?** A new project, an existing project, one in maintenance, or a refactor (restructure it to the standards).
2. **What kind of React project?** `website` (TanStack Start, SSR/SEO), `dashboard` (TanStack Table/Query + permissions, on Vite + TanStack Router, TanStack Start (SPA mode) or Next.js: you pick the framework),
   **both in one project** (`fullstack`: a site and an admin in one tree, each app with its own rules, skills and checks),
   or **any other React app** (`react`: Next.js, Remix, React Router, CRA, Expo web, …).

It then detects the stack (package manager, framework, router, data layer, styling, tests, linter, formatter, i18n,
source folders) and adapts the copied rules, permissions and hook commands to it. The hooks work with oxlint, eslint
or biome, oxfmt, prettier or biome, vitest or jest, and any source folder layout: without `srcDirs` they watch code in
any folder. Vue and Svelte are typechecked with `vue-tsc` and `svelte-check` when installed; `.astro` files need the
project's own typecheck command, because tsc cannot read them.

**Refactor mode** (`/frontend-kit:refactor-mode`): audit the project against the kit's standards, write a phased plan
you approve, then restructure one phase at a time with behaviour frozen and the gate green between phases.

**Working modes** (`/frontend-kit:mode list`): `new`, `existing`, `maintenance`, `refactor`, `upgrade`, `freeze` live in
`.claude/frontend-kit.json` and follow the branch; `hotfix`, `read-only`, `prototype` belong to the checkout. The default,
`existing`, adds nothing. The mode guard holds the edit tools and catches common shell forms: a guard rail, not a sandbox.

To leave a mode: `/frontend-kit:mode off`. If that cannot run (no jq, skill shell execution disabled, permission refused),
you, not Claude, set `"mode": "existing"` in `.claude/frontend-kit.json` in an editor and delete
`.claude/state/task-mode.json`.

A status line can show the mode: `bash <plugin>/scripts/mode-status.sh <project>`.

## Install in a project

```text
/plugin marketplace add DiyarFirasmusa/frontend-kit  # or the path of a local clone, to work on the kit
/plugin install frontend-kit@frontend-kit
/frontend-kit:setup                               # asks the profile and the project values
```

Restart Claude Code after setup. Requirements: `jq` (`brew install jq`), Node 20+, git. The guards need Claude Code 2.1.295
or later: earlier versions let a call through when a guard times out or cannot start.
Files you @-mention, MCP tools the matchers don't name, and what a script does are outside the hooks: keep the deny rules
and use the sandbox.

## What the hooks enforce

Values come from the project's `.claude/frontend-kit.json` (written by setup):

- No commit, merge, cherry-pick or push on protected branches; no force push, `--no-verify`, `reset --hard`, `clean -f`,
  `checkout -f`. The guard reads commands like the shell does, but it is a guard rail, not a sandbox: it does not see
  inside script files, package scripts or programs in other languages.
- No PR opened or merged by Claude; it prints the compare link instead.
- Asks you before Claude loosens the kit's protections: a guard switch, a live host, a protected branch or path, a gate
  command, the hooks or the plugin in Claude Code's settings. Where nobody can be asked (bypassPermissions, dontAsk) it refuses.
- No shell write into protected paths, lockfiles, `.git/`, the gate state or the git hooks.
- No code piped or downloaded straight into a shell, no publish or deploy, no install with another package manager.
- Notes after an edit: focused tests, suppressions, unsafe sinks, secrets behind a public prefix, changed check configs.
- No request, test or browser visit to the live hosts.
- No reading `.env*` secrets (`.env.example` is fine); no edits to deploy config or generated files.
- Format + lint every edited file (with the project's own tools); typecheck + related tests before Claude finishes a turn (committed work included); typecheck before a
  coding agent reports back.
- After a passing gate, one code review by the `frontend-reviewer` agent (Opus; `stopGate.review: false` turns it off).
- Names up to three skills that fit each prompt (`skill-suggest`), in English or Arabic: standard, Iraqi and English
  words in Arabic letters, however they are spelled or joined. It matches words, so it can miss a phrasing; a hint never
  blocks (`hooks.skillSuggest: false` turns it off).
- Warns before a `git commit` that has not passed the gate.
- Desktop alert when Claude waits for you; a log of failed tools; session clean-up.

Self-test, from a clone of the repository: `KIT_TEST_PROJECT=/path/to/project bash plugins/frontend-kit/scripts/test-hooks.sh`.

## Update

Projects set up by `/frontend-kit:setup` update the plugin on their own (`autoUpdate`) when its `version` changes; by
hand: `/plugin marketplace update frontend-kit`. Copied files (`CLAUDE.md`, rules, settings) don't update themselves:
re-run `/frontend-kit:setup` to pull template changes; it shows a diff before touching existing files.

Third-party skills and their licences: `THIRD_PARTY_NOTICES.md`.
