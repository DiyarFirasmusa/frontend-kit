---
name: commit-push
description: Commit and push the current task branch after the user's explicit yes ("commit", "commit push", "commmit", "yes commit push", "yes" to "Commit and push?"), then print the GitHub compare link. Commits as the user with no AI attribution, pushes only the task branch, never opens a PR, never merges.
---

# Commit & push

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/wajiha-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

## Preconditions (stop and say why if one fails)

- The user's latest message approves committing this change. A yes from
  earlier in the conversation doesn't cover new changes.
- `git branch --show-current` is a task branch, not a protected branch
  (<protectedBranches>).
- `git config user.name` and `user.email` are the user's own identity (the
  author named in `CLAUDE.md`, when it names one). If not, stop and tell the user.

## Steps

1. `git status --short` and `git diff --stat` to see everything that changed.
2. Stage the task's files by path (`git add <paths>`). Include project config
   under `.claude/` (`settings.json`, rules, `wajiha-kit.json`) when the
   task changed it. Never stage `.env*`, `.claude/settings.local.json`,
   `.claude/state/`, `dist/`, `.output/`, coverage or scratch files. Files
   that aren't the task's: leave them and list them in the report.
3. Commit with a message that passes commitlint:
   - header `<type>(<area>): <what changed>`, type one of `feat fix ui refactor
     perf test docs style chore build ci revert`, e.g. `fix(nav): profile pill follows Figma`
   - optional body: 1–4 plain lines on what changed for users
   - no "Claude", "AI", "Co-Authored-By" or session links
   Use `git commit -F - <<'EOF' … EOF` for a multi-line message.
4. A pre-commit hook fails (lint-staged, commitlint): read the error, fix the
   cause, stage again and commit again. Never `--no-verify`, `-n` or `HUSKY=0`.
5. `git push -u origin <current-branch>`. Never force. If the push is rejected,
   stop and tell the user (don't pull, rebase or merge on your own).
6. `git status --short`: nothing from the task may be left. If something is,
   say so.

## Report

```
Pushed <branch> @ <short-hash>: <commit header>
Open the PR: https://github.com/<githubRepo>/compare/<defaultBranch>...<branch>?expand=1
Left out: <files, or "nothing">
```

Nothing happens after this: no PR, no merge, no ticket comment without a yes.
