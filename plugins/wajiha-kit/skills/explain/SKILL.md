---
name: explain
description: Answer a why/how/what question about the project's code, a flow, an endpoint or a past change — or write a plain-language note for other people — without editing any file. Use when the user asks "why …?", "what endpoint …", "how does … work", "explain", "explane", "just read the code", or wants something to send to the team or backend.
---

# Explain (read-only)

This is a question, so the answer is words. Don't edit, create, stage or
format files, even when you spot something to fix: mention it at the end and
offer to change it.

## Find the real answer

- Read the code that runs, not what names suggest: follow the call from the
  page through the project's state and data layers to the endpoint (a hook,
  composable or service, and the API spec named in `CLAUDE.md`).
- Website (TanStack Start): also check the route's `loader`, `beforeLoad` and
  any server function (`createServerFn`) — the work may happen on the server.
  Dashboard (Vite + TanStack Router): everything runs in the browser.
- "Why did you change X" / "why is it like this": `git log -p --follow <file>`,
  `git blame -L <lines> <file>`, the diff of the task branch.
- Don't guess. If the code doesn't say, say what is known and what isn't.

## Answer

- Lead with the direct answer in one or two sentences, then the evidence:
  `file:line` references and the short code path (A → B → C).
- Plain words by default; non-technical when the user asks for it ("not tech"):
  what the user of the app sees and what the server is asked, no jargon.
- Endpoints: method, path, which step/screen calls it, and what it returns.

## Notes for other people (team, backend, mobile)

Written for them, not for the user: plain, short, no repetition, no internal
jargon or file paths unless the reader is a developer. For backend asks, use
the `backend-request` skill.
