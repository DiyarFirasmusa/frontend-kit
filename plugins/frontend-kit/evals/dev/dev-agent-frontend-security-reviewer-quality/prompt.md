---
name: dev-agent-frontend-security-reviewer-quality
description: The security reviewer finds the planted problems.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the frontend-security-reviewer agent on this code and list the security problems, ranked:

```tsx
// src/routes/_app/orders.$id.tsx
export const getOrder = createServerFn({ method: 'GET' }).handler(async ({ data }) => {
  const res = await fetch(`https://api.example.test/orders/${data.id}`, {
    headers: { Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}` },
  })
  return res.json()
})

export function OrderNote({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

// src/features/auth/session.ts
export function saveSession(token: string) {
  localStorage.setItem('access_token', token)
  const key = import.meta.env.VITE_ADMIN_API_KEY
  return key
}

// src/features/auth/sign-in.tsx
const next = new URLSearchParams(window.location.search).get('next')
export function afterSignIn() {
  navigate({ to: next ?? '/' })
}
```
