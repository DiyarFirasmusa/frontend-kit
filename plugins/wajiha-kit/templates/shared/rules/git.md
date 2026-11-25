# Git and GitHub

The wajiha-kit hooks (`guard-bash.sh`) and the deny rules in
`.claude/settings.json` block most of the "never" list below. A block is the
answer, not an obstacle: don't look for another spelling.

## Branches

- One branch per task, cut from the latest `origin/{{DEFAULT_BRANCH}}`:
  `git fetch origin && git checkout -b <type>/<ticket>-<short-name> origin/{{DEFAULT_BRANCH}}`
  (`fix/449-profile-pill`, `ui/settings-scroll`).
- Protected branches: {{PROTECTED_BRANCHES}}. They deploy; never commit, push
  or merge on them, and never branch from one that isn't `{{DEFAULT_BRANCH}}`.
- Uncommitted changes from something else on the current branch: stop and ask
  before creating a new branch.
- Refreshing a branch from `origin/{{DEFAULT_BRANCH}}` (rebase) only when the
  user asks.

## Commit and push

- Only after the user's yes **for this change**. A bare "commit", "commit push",
  "commmit" or "yes" is that yes, and it means commit **and** push. An earlier
  yes doesn't cover new changes.
- The author is the user's own git identity (`git config user.name`). The
  co-author line follows the project's `attribution` setting (Claude Code adds it by
  default); no other mention of Claude in messages, branch names or ticket comments.
- Conventional commits, enforced by commitlint: `<type>(<area>): <what changed>`
  with type `feat | fix | ui | refactor | perf | test | docs | style | chore | build | ci | revert`.
  Body (optional): 1–4 plain lines on what changed for users.
- Stage the task's files by path. Never stage `.env*`, `.claude/settings.local.json`,
  `.claude/state/`, `dist/`, `.output/`. Project config under `.claude/`
  (rules, `settings.json`, `wajiha-kit.json`) is committed when the task changed it.
- A failing pre-commit hook (lint-staged, commitlint) means fix and commit
  again. Never `--no-verify`, `-n`, `HUSKY=0` or a custom `core.hooksPath`.
- Push only the task branch: `git push -u origin <branch>`. Never force.
- After the push, `git status --short` must show nothing left from the task.
  List anything left out on purpose.

## Pull requests

Never open, merge or approve a PR (`gh pr create|merge`, the API, the web).
The user opens it from the compare link, printed after every push:

```
https://github.com/{{GITHUB_REPO}}/compare/{{DEFAULT_BRANCH}}...<branch>?expand=1
```

## Never

- `git reset --hard`, `git clean -f`, `git checkout .` / `git restore .`,
  `git stash` of someone else's work, deleting a protected branch.
- Editing `.git/` (including `.git/info/exclude`): tell the user the change.
