---
name: task
description: Start a new task on its own branch from origin/<defaultBranch>, implement it to the quality bar, verify it, then ask before commit/push. Use only when the user says "task", "this is the task", "new task", gives a ticket link (Jira, GitHub issue, Trello card, …), or runs /task. Not for a plain request to add a component, form, store, hook, page or route: those have their own skills (create-*, dash-*, web-*), use them directly. Never opens a PR, never merges.
argument-hint: "[ticket-url or task description]"
---

# Task

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

The user's rules: every task gets its own branch from `origin/<defaultBranch>`;
ask before any commit or push; never open a PR; never merge; no AI
attribution. Git details: `.claude/rules/git.md`. The bar:
`.claude/rules/quality-bar.md`.

## 1. Understand

- A ticket link is optional. If the user gives one, read it with the tracker
  tool that is connected (title, description, checklist, comments,
  attachments). If no tool can read it, ask the user to paste the text.
  Figma links in it are the spec (`figma-match` skill).
- Summarise the task back in 2–4 lines. If something decides the result and is
  unclear, ask one short question before touching code. Otherwise start.
- Large or multi-part task: write a todo list and keep it current.

## 2. Branch

1. `git status --short`. Changes from another task: stop and ask what to do
   with them; never carry them into the new branch.
2. `git fetch origin`
3. `git checkout -b <type>/<ticket>-<short-kebab-name> origin/<defaultBranch>`
   - type: `fix`, `feat`, `ui`, `refactor`, `perf` (the commit type matches)
   - ticket: the ticket number when there is one, e.g. `fix/449-profile-pill`;
     otherwise just `<type>/<short-kebab-name>`
4. Depends on another unmerged branch? Say so and ask which base to use.

## 3. Implement

- Follow the matching skill (`create-component`, `create-form`, `create-hook`,
  `create-store`, `refactor`, `i18n-conventions`, `performance`, and the
  profile's `web-*` / `dash-*` skills) and the path rules that load with the
  files.
- Strings in Arabic and English together. Tests with the change. Fix a pattern
  everywhere it occurs (`fix-everywhere`).
- Missing or wrong backend behaviour: say so (and offer `backend-request`),
  don't fake it in the frontend.

## 4. Verify

Run the `verify` skill: typecheck, lint, tests, i18n (when locales changed),
e2e (when a flow, route or layout changed), build, with the real numbers.
For a visible change also check the page on `http://localhost:<devPort>`
(`dev` skill) at phone and desktop width, Arabic and English, light and dark.
On a non-trivial change, spawn the `frontend-reviewer` agent (or the `review`
skill) and fix what it finds.

## 5. Report and ask

3–6 lines: what changed for users, branch, files, how it was verified, what
was not checked. Then ask exactly: **"Commit and push to `<branch>`?"**
On yes (a bare "commit" counts), use the `commit-push` skill.

## 6. Ticket update (only when asked)

Draft a short, human comment on what changed for users (no AI mention), show
it, and post it / move the ticket only after the user's yes.
