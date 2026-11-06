---
name: sync-main
description: Fetch origin and show how far the task branch is behind origin/<defaultBranch> and which incoming commits touch the same files. Rebases only when the user explicitly asks. Use when the user says "sync with main", "update from main", "is main ahead", "rebase on main".
---

# Sync with <defaultBranch>

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

## Look (always)

```sh
git fetch origin
git branch --show-current
git rev-list --left-right --count origin/<defaultBranch>...HEAD
git log --oneline HEAD..origin/<defaultBranch>
git diff --name-only HEAD...origin/<defaultBranch>
git diff --name-only origin/<defaultBranch>...HEAD
```

Report: N commits behind, the incoming commit headers, and the files changed
on both sides (likely conflicts). Then stop and ask whether to rebase.

## Rebase (only after the user asks for it in this conversation)

1. The working tree must be clean (`git status --short`). If not, stop and ask:
   commit first (`commit-push`), never stash someone's work on your own.
2. `git rebase origin/<defaultBranch>`
3. Conflicts: resolve each by keeping both sides' intent, run the `verify`
   skill, `git add <file>`, `git rebase --continue`. If a conflict is a
   product decision, `git rebase --abort` and ask.
4. A rebased branch that was already pushed needs a force push, which the hooks
   block. Tell the user and let them push it.

Never `git merge` into the branch here, never touch the protected branches
(<protectedBranches>).
