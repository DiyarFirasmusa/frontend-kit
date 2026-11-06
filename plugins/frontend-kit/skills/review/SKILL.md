---
name: review
description: Review the task branch (git diff origin/<defaultBranch>...HEAD plus uncommitted changes) on two separate axes — Standards (this repo's rules, React performance, code smells) and Spec (the ticket or request) — with fresh sub-agents, and report findings without editing. Use when the user asks to review the code, wants a separate agent to review, or before asking to commit a non-trivial change.
argument-hint: "[base ref, default origin/<defaultBranch>] [ticket-url or spec path]"
---

# Review

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

Reports only: never edits, stages or commits. Two axes, kept apart, because
code can follow every rule and still build the wrong thing (and the reverse).

## 1. Pin the change

```sh
git fetch origin <defaultBranch> -q
git diff --stat origin/<defaultBranch>...HEAD   # committed on the branch
git status --short                                 # uncommitted work is part of the review
git log --oneline origin/<defaultBranch>..HEAD
```

Base is `$ARGUMENTS`'s ref when given, else `origin/<defaultBranch>`. Empty
diff and a clean tree: say there is nothing to review and stop.

## 2. Find the spec

In order: a ticket link in the arguments or the conversation (read it with
the tracker tool that is connected — Jira, GitHub issues, Trello, …), the
user's request in this conversation, a ticket number in the branch name.
None: the Spec axis reports "no spec available".

## 3. Run both axes in parallel (fresh context each)

**Standards** — spawn the `frontend-reviewer` agent with the diff commands
above. Its brief: the repo's standards are `CLAUDE.md` and
`.claude/rules/*.md` (`quality-bar.md` first), plus any structure doc
`CLAUDE.md` points to. React performance from the
`vercel-react-best-practices` skill — website (TanStack Start): the server
rules apply to loaders and server functions, RSC rules don't; dashboard
(Vite + TanStack Router): client-side rules only. Also flag these smells as
judgement calls, never as violations, and only where no repo rule endorses
the code: mysterious name, duplicated code, feature envy, data clumps,
primitive obsession, repeated switches, shotgun surgery, divergent change,
speculative generality, message chains, middle man. Skip what the linter and
formatter catch. Cite `file:line` and the rule; separate hard violations from
judgement calls. Under 500 words.

**Spec** — spawn a `general-purpose` agent with the diff commands and the spec
text. Brief: report (a) requirements missing or partial, (b) behaviour nobody
asked for (scope creep, deleted UI that was only meant to change), (c)
requirements that look implemented but wrong, (d) strings missing in Arabic or
English, (e) Figma mismatches when a frame is linked. Quote the spec line for
each. Under 400 words.

## 4. Report

```markdown
## Standards
<the reviewer's findings, lightly cleaned: Blocking / Should fix / Suggestions>

## Spec
<the spec findings>

Standards: N findings, worst: … · Spec: M findings, worst: …
```

Don't merge or re-rank across the axes. Ask whether to fix the findings;
fixing is a separate step.
