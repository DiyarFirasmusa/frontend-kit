---
paths:
  - "**/{api,auth,login,session,server,security,seo}/**/*.{js,jsx,ts,tsx}"
  - "**/{auth,login,logout,session,cookie,cookies,token,use-auth,use-session,useAuth,useSession}.{js,jsx,ts,tsx}"
  - "**/{auth,login,session,token}-*.{js,jsx,ts,tsx}"
  - "**/*-{auth,login,session,token}.{js,jsx,ts,tsx}"
  - "**/*{redirect,upload,download,sanitize,consent,analytics,monitoring,sentry,guard,webhook}*.{js,jsx,ts,tsx}"
  - "**/*{json-ld,jsonld,csv,export-}*.{js,jsx,ts,tsx}"
  - "**/*.{server,functions,action,actions}.{js,jsx,ts,tsx}"
  - "**/{actions,route,proxy,middleware,instrumentation,instrumentation-client}.{js,ts}"
  - "**/src/{main,client,server}.{js,jsx,ts,tsx}"
  - "**/{entry.client,entry.server}.{js,jsx,ts,tsx}"
---

# Security in the frontend and its server code

The backend enforces access. These rules cover what the frontend and its server code must not get wrong. Defensive only.

## Data placed into HTML

- Inline JSON (JSON-LD, inline state, any `<script>`): `JSON.stringify`, then replace `<` with `\u003c` and U+2028 and
  U+2029 with `\u2028` and `\u2029`. Otherwise a string from a user or the backend closes the tag.
- Raw HTML (`dangerouslySetInnerHTML`, `innerHTML`, `v-html`): only written in the repo or sanitised. CMS, Markdown, URL and
  translated text count as untrusted.
- Templates escape text, not URL schemes: before data goes into `href` or `src` allow only `https:`, `mailto:`, `tel:` or a
  same-site path.

## Redirects

One helper checks every redirect target that comes from input, before and **after** normalising:

```ts
export function safeRedirect(value: string | null | undefined, origin: string, fallback = '/'): string {
  if (!value || !/^\/(?![/\\])/.test(value) || /\p{Cc}/u.test(value)) return fallback;
  const url = new URL(value, origin);
  // `/.//evil.com` keeps the origin but normalises to the protocol-relative `//evil.com`.
  if (url.origin !== origin || url.pathname.startsWith('//')) return fallback;
  return url.pathname + url.search + url.hash;
}
```

- Navigate to what it returns, never to the raw input.
- A return-to value is `pathname + search + hash`. `window.location.href` is absolute; a router's own `location.href` may
  already be relative (TanStack Router's is).
- Test: `/.//evil.com`, `/a/..//evil.com`, `//evil.com`, `/\evil.com`, `\t/evil.com`, `https://evil.com` and `javascript:alert(1)`
  give the fallback; `/%2F%2Fevil.com` stays on this origin.

## Server code (functions, actions, loaders, route handlers)

- Validate every input with the project's schema library. Authorise inside the handler: it is a public endpoint.
- A fetch built from input (SSRF): `https:` only, an allowed host, no private or link-local address, manual redirects, a
  timeout and a size cap. Axios `maxRedirects: 0` alone has failed with the fetch adapter (advisory of September 2026).
- An expected failure is returned as data (`{ ok: false, code, message }`); redirect and not-found may still throw. Never
  return or log a client error object: its config and headers carry tokens. Log status, code and endpoint.
- A secret never has a public prefix (`VITE_`, `NEXT_PUBLIC_`, or any prefix the bundler ships).

## Tokens, cookies, cross-origin

- Every script on the page can read `localStorage` and `sessionStorage`, so a token there is one XSS away from theft. Use an
  HttpOnly cookie when the backend can set one.
- Session cookies: `Secure; HttpOnly; SameSite`, `__Host-` where possible. On Next.js below 16.4.5 never set one in an Edge
  route (it leaked in a response header).
- CORS: never `*` with credentials, and never an open proxy to get around it.
- A `postMessage` listener checks `event.origin` against an allow-list before it reads the data.

## Uploads and downloads

- Check type and size on the server. The browser's MIME type is a hint, not a check. An SVG is a script.
- Serve uploads as attachments or from a separate origin, never as inline HTML on the app's origin.
- Release an object URL from `URL.createObjectURL` with `URL.revokeObjectURL` when it is no longer needed.
- A CSV cell that starts with `=`, `+`, `-`, `@`, a tab or a return gets a leading apostrophe (formula injection).

## Monitoring and third parties

- Monitoring starts only with a DSN, through one wrapper, and the release name is the one the source maps were uploaded
  with. No names, emails, tokens, bodies or query values; server code is initialised and scrubbed separately.
- With Sentry 11 set `dataCollection` explicitly: left unset it collects user, cookies, headers, bodies and query values,
  and `stackFrameVariables` (default true) sends local variables. On a server set it to `false`.
- Analytics and chat load after consent where the law requires it, and never receive personal data in events or URLs.
- A Content Security Policy is recommended. The kit does not write one: the team owns the host configuration. Record
  the decision in `project.md`.
