---
name: review
description: Review the task branch (diff against origin/<defaultBranch> plus uncommitted changes) on two axes, Standards (repo rules, performance, smells) and Spec (the ticket or request), with fresh sub-agents; reports, never edits. Use to review the code, or before committing a non-trivial change.
argument-hint: "[base ref, default origin/<defaultBranch>] [ticket-url or spec path]"
---

# Review

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/wajiha-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

Reports only: never edits, stages or commits. Two axes, kept apart, because
code can follow every rule and still build the wrong thing (and the reverse).

## 1. Pin the change

```sh
git fetch origin <defaultBranch> -q
git diff --stat origin/<defaultBranch>...HEAD   # committed on the branch
git --no-optional-locks status --short -uall    # uncommitted work and new files are part of the review
git log --oneline origin/<defaultBranch>..HEAD
git diff origin/<defaultBranch>...HEAD -- . ':(exclude,icase)*.env*'
git diff HEAD -- . ':(exclude,icase)*.env*'
```

A fetch that is refused or fails: use the local ref and say it may be stale.
Never diff or print a `.env` file; pass the exclusion on to every agent.

Base is `$ARGUMENTS`'s ref when given, else `origin/<defaultBranch>`. Empty
diff and a clean tree: say there is nothing to review and stop.

## 2. Find the spec

In order: a ticket link in the arguments or the conversation (read it with
the tracker tool that is connected — Jira, GitHub issues, Trello, …), the
user's request in this conversation, a ticket number in the branch name.
None: the Spec axis reports "no spec available".

## 3. Run the axes in parallel (fresh context each)

**Standards** — spawn the `frontend-reviewer` agent with the diff commands
above. Its brief: the repo's standards are `CLAUDE.md` and
`.claude/rules/*.md` (`quality-bar.md` first), plus any structure doc
`CLAUDE.md` points to. In a React project, performance from the
`performance` skill's `references/react-rules.md`, only the rules that fit the project's
`stack` (TanStack Start: server rules for loaders and server functions, not
the RSC ones; a client-only app: client-side rules only). Also flag these smells as
judgement calls, never as violations, and only where no repo rule endorses
the code: mysterious name, duplicated code, feature envy, data clumps,
primitive obsession, repeated switches, shotgun surgery, divergent change,
speculative generality, message chains, middle man. Skip what the linter and
formatter catch. Cite `file:line` and the rule; separate hard violations from
judgement calls. Under 500 words, but no blocking finding dropped for length.

**Spec** — spawn a `general-purpose` agent with the diff commands and the spec
text. Brief: report (a) requirements missing or partial, (b) behaviour nobody
asked for (scope creep, deleted UI that was only meant to change), (c)
requirements that look implemented but wrong, (d) strings missing in one of
the project's languages, (e) Figma mismatches when a frame is linked. Quote
the spec line for each. Under 400 words.

**Specialists** — only for a surface the diff really touches, and say which and
why: `frontend-security-reviewer` (auth, redirects, env, headers, server code),
`i18n-rtl-reviewer` (text or direction, in a project with several languages or
an RTL one), `seo-auditor` (an indexable page), `accessibility-auditor` (new or
reworked interactive UI). Most diffs need none.

## 4. Report

```markdown
## Standards
<the reviewer's findings, lightly cleaned: Blocking / Should fix / Suggestions>

## Spec
<the spec findings>

## Specialists (only those that ran)
<agent, why it ran, its verdict, findings and what it did not check>

Standards: N findings, worst: … · Spec: M findings, worst: …
```

Don't merge or re-rank across the axes. Ask whether to fix the findings;
fixing is a separate step.
