---
paths:
  - "**/*.test.{ts,tsx}"
  - "e2e/**"
  - "src/test/**"
---

# Testing

Every task ships with tests. **The project has no test runner yet.** Adding
one is its own task, done only when the user asks (suggested: Vitest +
Testing Library + user-event, a network mock such as MSW for integration
tests, Playwright for end-to-end). Until then, say plainly in the report that
no automated tests ran, and prove the change with `npm run check`
(typecheck + lint) and a manual check on the dev server (:3000).

## Commands

```sh
npm run check            # typecheck + lint:check
npm run check:full       # check + build
```

Add `test`, `test:e2e` and the like here (and `commands.relatedTests` in
`.claude/frontend-kit.json`) once a runner is installed.

## What to write (once a runner exists)

| Layer | Target | File |
| ----- | ------ | ---- |
| Unit | pure helpers, schemas, stores, page hooks | `<name>.test.ts` beside the source |
| Component | presentational components | `<name>.test.tsx` beside the source |
| Integration | client pages with the real API client and a mocked network | `<name>.test.tsx` beside it |
| End-to-end | each user flow | `e2e/<flow>.spec.ts` |
| Accessibility | every page | axe, WCAG 2.2 AA; serious/critical fail |

Minimum per change: the logic you touched is unit-tested; each touched page
has loading / error / empty / success plus one interaction; a new or changed
flow has an e2e spec.

## Conventions

- Colocate tests beside the source. No `__tests__` folders; `.spec.ts` only in `e2e/`.
- Query like a user: `getByRole`, `getByLabelText`, `getByText`.
  `data-testid` only when nothing accessible exists — and then fix the markup.
- Mock the **network**, never modules: no mocking of services, hooks or the
  API client.
- Async UI: `findBy*` / `waitFor`. Fake timers for time. No sleeps.
- Keep a test file under ~200 lines; split by behaviour. No whole-page snapshots.
- Never skip a test to get green — fix it or report the bug.

## Never

- Never run tests against production. Use the local dev server and mocks.
- No real tokens, phone numbers, emails or card data in fixtures.
- No assertions on Tailwind class strings.
- No unresolved `act()` warnings or `console.error` noise from code under test.
