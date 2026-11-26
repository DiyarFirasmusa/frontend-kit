# CLAUDE.md — {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

A frontend project. The kit adapts to the stack the project really uses, recorded in
`.claude/wajiha-kit.json` (`stack`, `commands`, `srcDirs`). Read it before assuming a tool.

Stack: {{FRAMEWORK}} · router {{ROUTER}} · data {{DATA_LIB}} · client state {{STATE_LIB}} ·
styling {{STYLING}} · tests {{TEST_RUNNER}} / {{E2E_RUNNER}} · lint {{LINTER}} · format {{FORMATTER}} ·
i18n {{I18N_LIB}} · package manager **{{PACKAGE_MANAGER}}**. Source folders: `{{SRC_DIR}}`.

The bar every change meets: `.claude/rules/quality-bar.md`. Area rules: `.claude/rules/`
(loaded on read or edit of a matching file, not on search).

## Hard rules

- Follow the stack above. Do not add a second library for something the project already has one for
  (second router, second data layer, second form library, second styling system).
- TypeScript projects: no `any`, no `@ts-ignore`, no `as` to silence the compiler. Use `unknown` and narrow.
- Server data lives in the data layer's cache; client state is for client-only state. Never copy server data
  into local state or a store (`data-and-state.md`).
- A submit or a destructive action is single-flight; delete asks to confirm first.
- Every user-facing string goes through the project's i18n when it has one. No hardcoded strings.
- Never test against the live site ({{LIVE_HOST}}). Use mocks, a local server or UAT ({{UAT_HOST}}).
- Never touch deploy config (`.github/`, `deploy/`, `server/`, the `build` script) or generated files.
- One branch per task from `origin/{{DEFAULT_BRANCH}}`. Ask before every commit and push. Never open or
  merge a PR, never push to {{PROTECTED_BRANCHES}}.

## Commands

The real commands are in `.claude/wajiha-kit.json` (`commands`) and `package.json` scripts. Typical set:

```sh
{{PM_RUN}} dev            # the dev server on :{{DEV_PORT}}
{{PM_RUN}} typecheck      # the typecheck
{{PM_RUN}} lint           # the linter
{{PM_RUN}} test           # unit tests
{{PM_RUN}} build          # last
```

## Folder layout

The project's own: "Where things are" in `.claude/rules/project.md`. How code is split is fixed (`structure.md`: view,
state, data and pure logic apart, one owner, one direction); folder and file names follow the project.

## Task delivery

- Implement directly: `task` for a new task, `create-component`, `create-form`, `create-hook`, `create-store`,
  `verify` before saying done, `review` before asking to commit a non-trivial change.
- Long runs: keep a todo list and keep going until done or truly blocked.
- Refactor mode (`/wajiha-kit:refactor-mode`): restructures the project to the principles in `structure.md` and the layout the user picks,
  phase by phase, with the gate between phases.

## Branches and environments

- Task branches come from `origin/{{DEFAULT_BRANCH}}`; the user opens PRs from
  `https://github.com/{{GITHUB_REPO}}/compare/{{DEFAULT_BRANCH}}...<branch>?expand=1`.
- Conventional commits (`fix(users): …`), never `--no-verify`.

## How the user talks (short, mixed languages, typos: read intent, not spelling)

| They write                        | They mean                                                       |
| --------------------------------- | --------------------------------------------------------------- |
| `commit`, `commit push`, `yes`    | Approval to commit **and** push the task branch (`commit-push`) |
| `continue`                        | Resume the last unfinished step; don't restart or re-ask        |
| `all`, `check all`, `other pages` | Every occurrence, proven by a final grep                        |
| `link`, `link pr`                 | Print the compare link + PR description (`commit-push`)         |
| `why …?`, `explain`               | Answer only, no edits                                           |
| a Figma link                      | Match it exactly (`figma-match`)                                |

## Conventions

- Every async UI state handles loading, error and empty. Forms show validation errors inline on the field.
- Comments explain why, never what. Files stay under 500 lines. Every task ships with tests (`testing.md`).
