---
paths:
  - "package.json"
  - "**/package.json"
  - ".npmrc"
  - "pnpm-workspace.yaml"
  - "package-lock.json"
  - "pnpm-lock.yaml"
  - "yarn.lock"
  - "bun.lock"
---

# Dependencies and supply chain

Every package is code that runs on the developer's machine and in CI. Before adding or upgrading one:

- Prefer what the project already has. Check the exact name, the publisher and the repository (typosquats are common).
  A release that is days old is unproven: wait, unless it is a security fix.
- Keep dependency install scripts off and approve them one by one after reading them: npm 12 blocks them by default
  (`npm approve-scripts <name>`), pnpm has `allowBuilds`. Use the package manager's release-age gate where it has one
  (pnpm `minimumReleaseAge`, in minutes; 1440 by default in pnpm 11).
- Keep git, tarball and remote dependencies blocked.
- Never run `curl | sh`, a `postinstall` you have not read, or an `npx <name>` that the project does not install.
- Commit the lockfile. CI installs frozen (`npm ci`, `pnpm install --frozen-lockfile`) and runs the manager's audit.
- A critical advisory in a framework is a same-day upgrade, rebuild and redeploy.
- A new dependency gets one sentence in the task report: why, and what it costs (size, install scripts, network access).

## Versions that carry known fixes (November 2026)

Only for packages the project has. Check the advisory before you pin, and use the latest patch of your line.

| Package | Advisory | Fixed in (least) |
| --- | --- | --- |
| `react-server-dom-*` (React Server Components) | RCE CVE-2025-55182, then DoS and source-exposure fixes | 19.0.7, 19.1.8, 19.2.7 (the RCE alone: 19.0.1, 19.1.2, 19.2.1) |
| `@tanstack/react-start` and `@tanstack/start-server-core` | CVE-2026-102989, reflected XSS in server-function responses | react-start 1.168.60, start-server-core 1.169.39. Rebuild and redeploy |
| Next.js | October and November 2026 releases (`use cache` and SVG optimisation RCEs; Edge cookie leak) | 16.4.5, 15.5.29; monthly security releases, so follow the line |
| `sharp` (Next image optimisation) | CVE-2026-96889, RCE through SVG | 0.35.5 |
| react-router | open redirect, XSS and CSRF fixes | 7.18.6 or 8.5.1; no patched 6.x. Confirm on the advisory page |
| axios | September 2026 batch, including SSRF through the fetch adapter | at least 1.20.0, better the latest 1.x; confirm on the advisory |

A floor from this table goes into `project.md` when the project pins it.
