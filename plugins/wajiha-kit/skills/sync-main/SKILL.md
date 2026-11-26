---
name: sync-main
description: Where the task branch stands - branch, ahead/behind origin/<defaultBranch>, unpushed commits, uncommitted changes, incoming commits on the same files. Rebases only on request. Use for "which branch", "is it pushed", "what's left to commit", "sync with main", "update from main", "rebase".
---

# Sync with <defaultBranch>

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/wajiha-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

## Look (always, read-only)

```sh
git fetch origin
git branch --show-current
git rev-list --left-right --count origin/<defaultBranch>...HEAD   # behind ahead
git rev-parse --abbrev-ref @{upstream}                  # may fail: not pushed yet
git log --oneline @{upstream}..HEAD                     # unpushed commits
git log --oneline HEAD..origin/<defaultBranch>          # incoming
git diff --name-only HEAD...origin/<defaultBranch>
git diff --name-only origin/<defaultBranch>...HEAD
git status --short
```

Report in this shape (omit empty lines):

```
Branch: <branch> (from origin/<defaultBranch>, <N> ahead, <M> behind)
Pushed: yes, up to date | no upstream yet | <K> commit(s) not pushed
Uncommitted: <count> — <files, grouped: src / tests / locales / config>
Incoming: <M> commit headers, and the files changed on both sides (likely conflicts)
On a protected branch (<protectedBranches>): WARNING — these deploy; never work on them
```

If there are unpushed or uncommitted task changes, ask whether to commit and push
(`commit-push`). If behind, stop and ask whether to rebase.

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
