---
name: info-agent-implicit-frontend-security-reviewer
description: The security reviewer is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Before we release this login flow, is there anything that could leak a session or send a user somewhere they should not go? Here is the code.

```ts
// src/features/auth/sign-in.tsx
const next = new URLSearchParams(window.location.search).get('next')
export function afterSignIn() {
  localStorage.setItem('access_token', token)
  navigate({ to: next ?? '/' })
}
```
