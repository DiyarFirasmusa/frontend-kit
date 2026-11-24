---
name: dev-agent-a11y-quality
description: The auditor finds the accessibility problems.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the accessibility-auditor agent on this snippet:

```tsx
export const Search = () => (
  <div>
    <input placeholder="Search" />
    <div onClick={() => doSearch()} style={{ color: '#aaa' }}>Go</div>
    <img src="/logo.png" />
  </div>
)
```
