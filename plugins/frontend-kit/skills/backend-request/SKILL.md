---
name: backend-request
description: Write or update docs/backend-requests.md, the plain-language list of endpoints, fields and behaviour the frontend needs from the backend team. Use when the user asks to note a missing endpoint, field or parameter, a wrong response, or to prepare something to send to the backend.
---

# Backend requests

`docs/backend-requests.md` is sent to the backend team as is. Write it as a
person writing to colleagues, not as internal frontend notes. Create the file
with the sections below if it does not exist.

## Each item

1. Heading: number, short name, method and path, priority —
   `### 1.4 Order history filter — GET /api/v1/Orders (P1)`.
2. One short paragraph: what the user is doing in the app, why the
   current API is not enough, what we do meanwhile.
3. A JSON block with the request and/or response wanted. For existing
   responses show only the new or changed fields, inside the project's
   response envelope when it has one (see `CLAUDE.md` / the API rule).
4. One sentence for non-obvious behaviour (empty list vs 404, sort order,
   which language a `message` is in, an error reported with HTTP 200).

## Sections

1. New endpoints. 2. Fields to add to existing responses. 3. Request
parameter changes. 4. General (errors and messages, CORS, cookies, paging,
SEO-relevant data such as slugs and meta descriptions). 5. Waiting to be tested.

## Rules

- Priorities: P1 a user flow breaks or misbehaves without it, P2 a
  designed element is missing, P3 nice to have.
- Field names are suggestions; say the backend may rename them.
- No frontend internals: no `src/` paths, hook, store or component names.
- Mirror the API spec's names exactly for existing schemas (`CLAUDE.md` says
  where the spec lives).
- When the backend ships it: update the item, regenerate the API types with
  the project's generator script, then services, MSW mocks and tests.
