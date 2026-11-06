---
name: live-check
description: Check a change in a real browser — the user's own logged-in Chrome through the Chrome MCP — against the local dev server or UAT, never the live site. Use when the user says "live check", "check in Chrome", "open chrome mcp", "test it as a real user", or a flow needs a real login (OTP, SSO, a payment or third-party flow on UAT).
---

# Live check (UAT / local only)

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

## Rules

- Targets: `http://localhost:<devPort>` (dev server, pointed at UAT or
  mocks) or `https://<uatHost>`. Never `<liveHost>`: the hooks block it,
  and an action there is real (a real order, a real record, a real message).
- The user logs in, not you. Never type a password, OTP or card number; never
  read them back. Ask: "Log in on the open tab and tell me when you're in."
- If the access token lives in memory only (see `CLAUDE.md`), don't reload or
  open the page in a new tab after the login: it may sign the user out.
  Navigate inside the app (click links) instead.
- Don't create, pay, delete or change real data unless the user asks for
  that exact action.

## Steps

1. Make sure the dev server answers on :<devPort> (`dev` skill) when
   checking locally.
2. Load the browser tools (`claude-in-chrome` skill, or chrome-devtools
   MCP), list the tabs, and open the target in a new tab.
3. Ask the user to log in when the flow needs it; wait for their go.
4. Walk the changed flow like a real user: each screen in Arabic and English,
   phone width (375) and desktop, light and dark. Watch the console and
   network panels for errors and failed requests.
5. Screenshot each state that matters.

## Report

Pass/fail per step with what you saw, console errors, failing requests
(method, path, status — no tokens or personal data), and screenshots.
