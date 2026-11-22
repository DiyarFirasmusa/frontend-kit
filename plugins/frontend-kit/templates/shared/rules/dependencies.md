---
paths:
  - "package.json"
  - "**/package.json"
  - ".npmrc"
  - "pnpm-workspace.yaml"
---

# Dependencies and supply chain

Every package is code that runs on the developer's machine and in CI. Before adding or upgrading one:

- Prefer what the project already has. A package whose latest release is days old is unproven: wait, or pin the version
  you read.
- Install scripts. npm 12 does not run dependency install scripts by default; approve one with `npm approve-scripts <name>`
  after reading what it runs. pnpm: `allowBuilds` in the workspace, and `minimumReleaseAge` (minutes; 1440 by default in
  pnpm 11) holds back brand-new versions. For Yarn and Bun, check their docs; this file does not state their settings.
- Never run `curl | sh`, a `postinstall` you have not read, or an `npx <name>` that the project does not install.
- Commit the lockfile. CI installs with the frozen mode (`npm ci`, `pnpm install --frozen-lockfile`).
- A new dependency gets one sentence in the task report: why, and what it costs (size, install scripts, network access).

## Versions that carry known fixes (November 2026)

Check the advisory before you pin. Each floor is the least version that carries the fix; use the latest patch of your line.

| Package | Advisory | Fixed in (least) |
| --- | --- | --- |
| `react-server-dom-*` (React Server Components) | CVE-2025-55182 | 19.0.1, 19.1.2, 19.2.1 |
| `@tanstack/react-start` and `@tanstack/start-server-core` | CVE-2026-102989, reflected XSS in server-function responses | react-start 1.168.60, start-server-core 1.169.39. Rebuild and redeploy |
| Next.js | October and November 2026 releases (`use cache` and SVG optimisation RCEs; Edge cookie leak) | 16.4.5, 15.5.29; monthly security releases, so follow the line |
| react-router | open redirect and XSS fixes in 7.x | 7.18.6 or 8.5.1; no patched 6.x. Confirm on the advisory page |
| axios | September 2026 batch, including SSRF through the fetch adapter | latest 1.x; confirm the exact fixed version on the advisory |

A floor from this table goes into `project.md` when the project pins it.
