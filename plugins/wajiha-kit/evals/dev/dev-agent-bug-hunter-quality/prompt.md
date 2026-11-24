---
name: dev-agent-bug-hunter-quality
description: The bug hunter finds the root cause.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the bug-hunter agent: this pagination helper shows the last item twice and skips the first on page 2. Find the root cause and propose a minimal fix with a test.

```ts
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize - 1
  const end = start + pageSize
  return items.slice(start, end)
}
```
