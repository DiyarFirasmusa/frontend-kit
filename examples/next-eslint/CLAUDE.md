# CLAUDE.md — fresh-next

@AGENTS.md

A React project. The kit adapts to the stack the project really uses, recorded in
`.claude/frontend-kit.json` (`stack`, `commands`, `srcDirs`). Read it before assuming a tool.

Stack: Next.js 16 · router Next.js App Router · data fetch hooks · client state React state ·
styling Tailwind v4 · tests none yet / none · lint eslint · format none ·
i18n none · package manager **npm**. Source folders: `src`.

The bar every change meets: `.claude/rules/quality-bar.md`. Area rules: `.claude/rules/`.

## Hard rules

- Follow the stack above. Do not add a second library for something the project already has one for
  (second router, second data layer, second form library, second styling system).
- TypeScript projects: no `any`, no `@ts-ignore`, no `as` to silence the compiler. Use `unknown` and narrow.
- Server data lives in the data layer's cache; client state is for client-only state. Never copy server data
  into local state or a store (`data-and-state.md`).
- A submit or a destructive action is single-flight; delete asks to confirm first.
- No i18n yet (English LTR only): keep user-facing strings together so adding a library later is cheap.
- Never test against production. Use mocks or the local dev server on :3000.
- Never touch deploy config (`.github/`, `deploy/`, `server/`, the `build` script) or generated files.
- One branch per task from `origin/main`. Ask before every commit and push. Never open or
  merge a PR, never push to main, master.

## Commands

The real commands are in `.claude/frontend-kit.json` (`commands`) and `package.json` scripts. Typical set:

```sh
npm run dev        # the dev server on :3000
npm run typecheck  # the typecheck
npm run lint:check # the linter (eslint .)
npm run check      # typecheck + lint:check
npm run build      # last
```

## Folder layout

Group by feature, not by file type (`structure.md`). A feature owns its components, hooks, services and tests;
only code used by two or more features moves to a shared folder. No barrel files, kebab-case file names,
one component per file.

## Task delivery

- Implement directly: `task` for a new task, `create-component`, `create-form`, `create-hook`, `create-store`,
  `verify` before saying done, `review` before asking to commit a non-trivial change.
- Long runs: keep a todo list and keep going until done or truly blocked.
- Refactor mode (`/frontend-kit:refactor-mode`): restructures the project to the standards in `structure.md`,
  phase by phase, with the gate between phases.

## Branches and environments

- Task branches come from `origin/main`. No `origin` remote yet: once there is one, the user opens PRs
  from `https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1`.
- Conventional commits (`fix(users): …`), no AI attribution, never `--no-verify`.

## How the user talks (short, mixed languages, typos: read intent, not spelling)

| They write                        | They mean                                                       |
| --------------------------------- | --------------------------------------------------------------- |
| `commit`, `commit push`, `yes`    | Approval to commit **and** push the task branch (`commit-push`) |
| `continue`                        | Resume the last unfinished step; don't restart or re-ask        |
| `all`, `check all`, `other pages` | Every occurrence, proven by a final grep (`fix-everywhere`)     |
| `link`, `link pr`                 | Print the compare link + PR description (`pr-link`)             |
| `why …?`, `explain`               | Answer only, no edits (`explain`)                               |
| a Figma link                      | Match it exactly (`figma-match`)                                |

## Conventions

- Every async UI state handles loading, error and empty. Forms show validation errors inline on the field.
- Comments explain why, never what. Files stay under 500 lines. Every task ships with tests (`testing.md`); there is no test runner yet, so say so in the report.
