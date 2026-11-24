---
paths:
  - "**/{auth,session,login,logout}/**"
  - "**/{auth,session,login,logout,use-auth,use-session,useAuth,useSession}.{js,jsx,ts,tsx}"
  - "**/{auth,session,login}-*.{js,jsx,ts,tsx}"
  - "**/*-{auth,session,login}.{js,jsx,ts,tsx}"
  - "**/{auth,session}{Context,Provider,Store,Service,Client}.{js,jsx,ts,tsx}"
  - "**/*{access,refresh,auth}-token*"
  - "**/{token.service,token-store,token-storage}.{js,ts}"
  - "**/api-client*"
  - "**/{proxy,middleware}.{js,ts}"
  - "**/*.server.{js,ts,tsx}"
---

# Auth and session (a browser app that holds its own tokens)

Written from the bugs a reviewer found, build after build, in apps like this. If the backend offers an HttpOnly refresh
cookie, use it and most of this disappears; ask for it (a refresh token in `localStorage` is readable by any XSS).

- **Tokens.** The access token lives in memory. The refresh token lives in storage only when there is no cookie flow, with an
  in-memory fallback when storage is blocked. A reload restores the session by exchanging the refresh token.
- **One refresh at a time**, per tab (single-flight promise) and across tabs (`navigator.locks`, with a timeout such as
  `AbortSignal.timeout(15_000)` so a hung request cannot freeze every tab; a plain fallback when locks are missing). Read the
  stored refresh token **inside** the lock: another tab may have rotated it while this one waited.
- **A rotation is not a new user.** Store a session or user id next to the refresh token. `storage` events from other tabs
  end the session when the token is removed and reset the session only when the id changes; a rotation is ignored. Keying on the
  token itself makes two tabs refresh each other forever.
- **What ends a session.** Only the backend rejecting the refresh token (401, or the backend's "invalid grant" status). A 5xx or a
  network error keeps the session and shows "offline, retry", not "session expired". Parallel 401s share one refresh and retry once.
- **Sign-out wins.** Keep a session epoch: a refresh that finishes after sign-out must not restore the session (and its new
  token is revoked). Send the logout request with the token snapshot taken before clearing. Sign-out is safe to double-click.
- **Cache.** Clear the data cache (`queryClient.clear()`) whenever the session changes hands, so the next user never sees the
  previous user's orders; navigate first, so no account query refetches without a token.
- **Guards.** Restore the session before deciding to redirect. If the API is unreachable show an error with Retry; redirecting
  `/account` to `/login` and `/login` back to `/account` is a ping-pong.
- **The `redirect` parameter** accepts internal paths only: parse with `new URL(value, location.origin)`, reject another origin,
  a pathname that starts with `//` once normalised, and `/login` itself. The helper and its test list: `security.md`.
- **The login form** never puts the password in the URL (`method="post"`), disables double submit, and a wrong password does not
  trigger a token refresh or a retry.
