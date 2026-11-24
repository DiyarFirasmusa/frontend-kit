# CLAUDE.md — refactor-legacy

A deliberately messy app used to show refactor mode.

A React project. The kit adapts to the stack the project really uses, recorded in
`.claude/wajiha-kit.json` (`stack`, `commands`, `srcDirs`). Read it before assuming a tool.

Stack: Vite · router none · data none yet · client state React state ·
styling plain CSS · tests none yet / none · lint eslint · format none ·
i18n none · package manager **npm**. Source folders: `src`.

The bar every change meets: `.claude/rules/quality-bar.md`. Area rules: `.claude/rules/`.

## Hard rules

- Follow the stack above. Do not add a second library for something the project already has one for
  (second router, second data layer, second form library, second styling system).
- TypeScript projects: no `any`, no `@ts-ignore`, no `as` to silence the compiler. Use `unknown` and narrow.
- Server data lives in the data layer's cache; client state is for client-only state. Never copy server data
  into local state or a store (`data-and-state.md`).
- A submit or a destructive action is single-flight; delete asks to confirm first.
- Every user-facing string goes through the project's i18n when it has one. No hardcoded strings.
- Never test against the live site (). Use mocks, a local server or UAT ().
- Never touch deploy config (`.github/`, `deploy/`, `server/`, the `build` script) or generated files.
- One branch per task from `origin/main`. Ask before every commit and push. Never open or
  merge a PR, never push to main, master.

## Commands

The real commands are in `.claude/wajiha-kit.json` (`commands`) and `package.json` scripts. Typical set:

```sh
npm run dev            # the dev server on :5173
npm run typecheck      # the typecheck
npm run lint           # the linter
npm run test           # unit tests
npm run build          # last
```

## Folder layout

Group by feature, not by file type (`structure.md`). A feature owns its components, hooks, services and tests;
only code used by two or more features moves to a shared folder. No barrel files, kebab-case file names,
one component per file.

## Task delivery

- Implement directly: `task` for a new task, `create-component`, `create-form`, `create-hook`, `create-store`,
  `verify` before saying done, `review` before asking to commit a non-trivial change.
- Long runs: keep a todo list and keep going until done or truly blocked.
- Refactor mode (`/wajiha-kit:refactor-mode`): restructures the project to the standards in `structure.md`,
  phase by phase, with the gate between phases.

## Branches and environments

- Task branches come from `origin/main`; the user opens PRs from
  `https://github.com/your-org/refactor-legacy/compare/main...<branch>?expand=1`.
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
- Comments explain why, never what. Files stay under 500 lines. Every task ships with tests (`testing.md`).
