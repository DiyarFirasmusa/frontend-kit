---
name: dev-agent-ui-designer-quality
description: "Explicit agent request; the agent must find the planted problems."
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the ui-designer agent to review this page and list the design problems:

```tsx
export const Settings = () => (
  <div style={{ padding: 13 }}>
    <h1 style={{ fontSize: 17 }}>Settings</h1>
    <h3 style={{ fontSize: 22, marginTop: 5 }}>Profile</h3>
    <label style={{ marginLeft: 7 }}>Name <input style={{ borderRadius: 3 }} /></label>
    <button style={{ background: '#3b82f6', padding: '4px 9px', marginTop: 31 }}>save</button>
  </div>
)
```
