---
name: dev
description: Start, restart or free the project's dev server on port <devPort> and wait until it answers. Use when the user says run the website, run the dashboard, run on port <devPort>, kill/stop the port, restart the server, or the app serves a stale module (then clear the Vite cache).
argument-hint: "[restart | stop | clear-cache]"
---

# Dev server (:<devPort>)

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

The app always runs on **<devPort>** with `--strictPort`, so it never drifts
to the next free port. E2E uses its own server on <e2ePort>; leave that alone.

## 1. Look at the port first

```sh
lsof -nP -iTCP:<devPort> -sTCP:LISTEN
```

- Nothing listening: go to step 3.
- This project's Vite (`ps -o pid=,command= -p <pid>` shows `vite` and
  `lsof -a -p <pid> -d cwd -Fn` is this repo) and the user only wants it
  running: report the URL and stop. Asked to restart or stop: step 2.
- Anything else (another project, another app): show the user what it is
  (pid, command, folder) and ask before stopping it. Never kill a process you
  can't name.

## 2. Stop it

`kill <pid>` (not `-9` unless it ignores SIGTERM for 5 s), then confirm the
port is free with the `lsof` line above. `stop` ends here.

## 3. Clear the cache (only for `clear-cache`, or "stale" / "old module" symptoms)

```sh
rm -rf node_modules/.vite
```

Website (TanStack Start): also `rm -rf .tanstack` if routes look stale.
Both profiles regenerate `src/routeTree.gen.ts` on start — never edit it.

## 4. Start and wait

Run in the background (both profiles run on Vite):

```sh
npx vite dev --port <devPort> --strictPort
```

Use `commands.dev` from `.claude/frontend-kit.json` when it is set. For other frameworks the same idea: Next.js
`next dev -p <devPort>`, React Router framework mode `react-router dev --port <devPort>`; clear that framework's cache, not `.vite`.

Then wait until it answers, at most ~30 s:

```sh
for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:<devPort>/ && break; sleep 1; done
```

Report `http://localhost:<devPort>` only after it answered. If it didn't,
show the last lines of the server output. The API base (`<apiBaseEnv>`, or
the dev proxy that forwards `/api`) points at UAT (<uatHost>) or local
mocks; it must never point at the live host (<liveHost>).
