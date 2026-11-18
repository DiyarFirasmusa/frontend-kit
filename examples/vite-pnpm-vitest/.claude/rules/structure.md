# Structure: the standard layout (and the target of refactor mode)

Applies to every React project, whatever the framework. Adapt names to the framework's own conventions
(`app/` or `pages/` routes stay where the framework needs them); the principles do not change.

- **Feature folders.** `features/<feature>/` owns its components, hooks, services, types and tests. Code used by
  two or more features goes to `shared/` (`shared/components`, `shared/hooks`, `shared/lib`). Nothing in a feature
  imports from another feature's internals; go through `shared/` or a public file.
- **Dependency direction.** `routes/pages → features → shared`. Never the other way, never sideways.
- **One component per file**, named export, kebab-case file names. A component over ~200 lines, or with more than one
  reason to change, is split. Page components are JSX plus one page hook.
- **Logic out of JSX.** Data fetching, mutations and orchestration live in hooks; pure logic in plain functions in
  `lib/` with unit tests; components render.
- **No barrel files** (`index.ts` re-exports): they break tree-shaking, hide cycles and slow the typechecker.
- **No circular imports.** If A and B need each other, the shared part moves down.
- **Types next to their use**; API types come from one place (generated or hand-written), never copied per feature.
- **Config at the edge.** Environment variables are read in one module, validated, and imported from there.
- **Files stay under 500 lines**, functions under ~50; extract by responsibility, not by line count.
- **TypeScript strict**: `strict: true`, no `any`, no unchecked casts, `import type` for types.
- **Dead code is deleted**, not commented out: unused exports, files, dependencies and feature flags.
