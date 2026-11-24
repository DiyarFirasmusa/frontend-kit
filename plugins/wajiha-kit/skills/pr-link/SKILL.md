---
name: pr-link
description: Print the GitHub compare link for the current branch plus a ready-to-paste PR description, so the user opens the PR by hand. Use when the user says "link pr", "pr link", "give me the link", "link". Never creates, merges or comments on a PR.
---

# PR link

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/wajiha-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

1. `git branch --show-current`. On a protected branch (<protectedBranches>):
   stop, there is no PR to open.
2. `git fetch origin <defaultBranch> -q`, then check the branch is pushed
   and current: `git rev-list --count @{upstream}..HEAD` (unpushed commits) —
   if the branch has no upstream or unpushed commits, say so and offer
   `commit-push` first.
3. Read what the PR contains: `git log --oneline origin/<defaultBranch>..HEAD`
   and `git diff --stat origin/<defaultBranch>...HEAD`; open the diff for
   anything unclear.
4. Print:

```
https://github.com/<githubRepo>/compare/<defaultBranch>...<branch>?expand=1
```

then a PR description in plain words, for a teammate, not for the user:

```markdown
## Summary
<one or two sentences: what this PR does and why>

## What changed for users
- <visible behaviour, per screen; Arabic and English where it differs>

## How it was tested
- <gates that ran, with numbers: typecheck, lint, N tests, e2e, build>
- <manual checks: pages, phone/desktop, ar/en, light/dark>

## Risks
- <what could break, what to look at in review; "none known" if so>
```

Title suggestion: the main commit header. The ticket link at the end when
there is one. Never run `gh pr create` or post anything to GitHub.
