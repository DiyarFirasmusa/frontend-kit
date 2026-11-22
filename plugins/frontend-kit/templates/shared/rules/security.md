---
paths:
  - "**/src/**/*.{ts,tsx}"
  - "app/**/*.{ts,tsx}"
---

# Security in the frontend and its server functions

The backend enforces access. These rules cover what the frontend and its server code must not get wrong. Defensive only.

## Data placed into HTML

- Inline JSON (JSON-LD, inline state, any `<script>`): `JSON.stringify`, then replace `<` with `<` and U+2028 and
  U+2029 with their escapes. A string from a user or the backend can otherwise close the tag.
- `dangerouslySetInnerHTML` only with HTML that the server sanitised and you trust. Never with backend text.
- React escapes text children. It does not check the scheme of an `href`: check `https:`, `mailto:`, `tel:` or a same-site
  path yourself before you put data into `href`.

## Redirects

- One helper, `safeRedirect(value)`. It accepts only a path that starts with a single `/` (not `//` and not `/\`), with no
  control characters (tab, newline), and no other origin. Parse with `new URL(value, origin)` and compare `origin`.
- Redirects carry `pathname + search + hash`, never `location.href`, which is absolute.
- Test these inputs: `/.//evil.com`, `//evil.com`, `/\evil.com`, `/%2F%2Fevil.com`, `\t/evil.com`, `https://evil.com`,
  `javascript:alert(1)`.

## Server functions and route handlers

- Validate every input with zod. Authorise inside the handler: a server function is a public endpoint.
- Never fetch a URL that a user supplies without an allow-list of hosts. Do not follow redirects from user URLs (SSRF).
- Return failures as data (`{ ok: false, code, message }`), never the raw `Error` or an axios error: they carry status, URLs,
  headers and stacks. Log the detail on the server.
- A secret never has a public prefix (`VITE_`, `NEXT_PUBLIC_`, or any prefix the bundler ships). See `react/auth.md`.

## Tokens and storage

- `localStorage` and `sessionStorage` are readable by every script that runs on the page, so a token there is one XSS away
  from theft. Use an HttpOnly cookie when the backend can set one (`react/auth.md`).

## Uploads and downloads

- Check type and size on the server. The browser's MIME type is a hint, not a check.
- Serve uploads as attachments or from a separate origin, never as inline HTML on the app's origin.
- Release an object URL from `URL.createObjectURL` with `URL.revokeObjectURL` when the component no longer needs it.
- A CSV cell that starts with `=`, `+`, `-` or `@` gets a leading apostrophe or tab (spreadsheet formula injection).

## Cross-window messages

- A `postMessage` listener checks `event.origin` against an allow-list before it reads the data.

## Third parties and headers

- Analytics and chat widgets load after consent where the law requires it, and never receive personal data in event names,
  URLs or user fields.
- A Content Security Policy is recommended. The kit does not write one: it belongs in the host configuration, which the
  team owns. Record the decision in `project.md`.
