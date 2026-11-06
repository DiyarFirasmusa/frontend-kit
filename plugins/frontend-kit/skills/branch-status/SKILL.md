---
name: branch-status
description: Show where the current branch stands — branch, base, ahead/behind origin/<defaultBranch>, unpushed commits, uncommitted changes. Use when the user asks "which branch", "what's the status", "is it pushed", "what's left to commit". Read-only.
---

# Branch status

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

Read-only: run, then report. Change nothing.

```sh
git fetch origin -q
git branch --show-current
git rev-list --left-right --count origin/<defaultBranch>...HEAD   # behind ahead
git rev-parse --abbrev-ref @{upstream}                 # may fail: not pushed yet
git log --oneline @{upstream}..HEAD                    # unpushed commits
git log --oneline origin/<defaultBranch>..HEAD      # what the PR would contain
git status --short
```

Report in this shape (omit empty lines):

```
Branch: <branch> (from origin/<defaultBranch>, <N> ahead, <M> behind)
Pushed: yes, up to date | no upstream yet | <K> commit(s) not pushed
Uncommitted: <count> — <files, grouped: src / tests / locales / config>
On a protected branch (<protectedBranches>): WARNING — these deploy; never work on them
```

If behind origin/<defaultBranch>, mention `sync-main`; if there are
unpushed or uncommitted task changes, ask whether to commit and push.
