# Data and state

Use the data layer the project already has (see `stack.data` in `.claude/wajiha-kit.json`). Today that is Next.js
itself: data loaded in Server Components / route handlers with `fetch` through one API client; no client cache
library yet. Do not add one unasked. The rules below hold for whichever layer is used.

- **Server state and client state are different things.** Server data lives in the data layer's cache, keyed
  consistently; client-only state (open dialogs, drafts, UI preferences) lives in local state or the project's store.
  Never copy server data into `useState` or a store to "keep it".
- **One place builds the keys/queries** for each entity (a key factory or one query module), so invalidation is
  predictable. After a mutation, invalidate or update exactly the affected keys.
- **One API client.** Features never call `fetch`/axios directly; the client handles base URL, auth headers,
  401 handling and error shaping once.
- **Every async view has loading, error and empty states.** No view renders `undefined` from an unresolved query.
- **Derive, don't store.** Anything computable from props/state/cache is computed (and memoised only when measured slow).
- **URL state in the URL**: list page, sort and filters of a screen belong in the URL (search params), not in a store.
- **Effects are for synchronising with the outside world**, not for deriving state or reacting to events; prefer event
  handlers and data-layer callbacks.
- **Global stores stay small**: auth/session, preferences, cross-route hand-offs. Reset them on sign-out.
