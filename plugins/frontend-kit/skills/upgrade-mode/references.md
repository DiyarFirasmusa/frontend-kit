# Upgrade references (official, as of 2026-11-22; open them, the pages move)

Starting points only. Each item is a change a typecheck does not show; the guide of the version you target is the authority.
The list is examples: for any other stack open that project's own migration guide. A maintenance-line update can be
semver-minor and still breaking, so read its notes too.

- React 19: https://react.dev/blog/2024/04/25/react-19-upgrade-guide — go through 18.3 first for warnings; run the codemods; render errors
  are reported differently and no longer rethrown, so error reporting may need new root options; `ref` becomes a prop.
- Next.js 16: https://nextjs.org/docs/app/guides/upgrading/version-16 — Turbopack is the default (a custom webpack config
  fails the build), image defaults change, async request APIs need their own codemod, middleware is not simply renamed.
  `next build` no longer lints and no longer prints sizes: run lint on its own and measure the bundle with an analyzer. Experimental
  agent path: https://nextjs.org/docs/app/guides/upgrading/agent-upgrade (not for production; use it only if the user wants it).
  Support dates: https://nextjs.org/support-policy
- Tailwind v4: https://tailwindcss.com/docs/upgrade-guide — run the upgrade tool, then look at the screen: renamed scales, default
  border colour and ring width change, and a removed utility silently produces no CSS. Raises browser minimums.
- TanStack Query v5: https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5 — the codemod is best effort;
  retry defaults on the server, the meaning of `isLoading`, and removed query callbacks change behaviour silently.
- TanStack Table: https://tanstack.com/table/latest/docs/framework/react/guide/migrating — an incremental path exists; selection
  and pinning defaults change.
- npm and pnpm: `legacy-peer-deps` switches the peer contract off; pnpm catalogs keep one shared version per workspace.
