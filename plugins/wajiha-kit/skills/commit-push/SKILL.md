---
name: commit-push
description: Commit and push the task branch after the user's explicit yes ("commit", "commmit", "commit push", "yes" to "Commit and push?"), then print the compare link. Also for "link pr", "pr link", "link" - print the link and a PR description. Never opens or merges a PR.
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
   - the co-author line follows the project's `attribution` setting (Claude Code adds it
     by default); nothing else about Claude or AI, and no session links
   Use `git commit -F - <<'EOF' … EOF` for a multi-line message.
4. A pre-commit hook fails (lint-staged, commitlint): read the error, fix the
   cause, stage again and commit again (never skip the hook, `.claude/rules/git.md`).
5. `git push -u origin <current-branch>`. If it is rejected, stop and tell the
   user (don't pull, rebase or merge on your own).
6. `git status --short`: nothing from the task may be left. If something is,
   say so.

## Report

```
Pushed <branch> @ <short-hash>: <commit header>
Open the PR: https://github.com/<githubRepo>/compare/<defaultBranch>...<branch>?expand=1
Left out: <files, or "nothing">
```

Nothing happens after this: no PR, no merge, no ticket comment without a yes.

## Link and PR text (when asked: "link pr", "pr link", "give me the link", "link")

Read-only, no yes needed: nothing is committed, pushed, created or posted.

1. `git branch --show-current`. On a protected branch (<protectedBranches>)
   stop: there is no PR to open.
2. `git fetch origin <defaultBranch> -q`, then `git rev-list --count @{upstream}..HEAD`.
   No upstream or unpushed commits: say so and offer the commit and push above
   (it needs the user's yes).
3. Read what the PR contains: `git log --oneline origin/<defaultBranch>..HEAD` and
   `git diff --stat origin/<defaultBranch>...HEAD`; open the diff for anything unclear.
4. Print the compare link (as in the Report) and a PR description in plain words,
   for a teammate, not for the user:

```markdown
## Summary
<one or two sentences: what this PR does and why>

## What changed for users
- <visible behaviour, per screen; each language where it differs>

## How it was tested
- <gates that ran, with numbers: typecheck, lint, N tests, e2e, build>
- <manual checks: pages, phone/desktop, languages, light/dark>

## Risks
- <what could break, what to look at in review; "none known" if so>
```

Title suggestion: the main commit header; the ticket link at the end when there is one.
Never run `gh pr create` or post anything to GitHub.
