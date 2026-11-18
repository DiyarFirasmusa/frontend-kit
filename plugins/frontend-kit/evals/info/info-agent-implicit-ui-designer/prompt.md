---
name: info-agent-implicit-ui-designer
description: The ui-designer agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

The settings page works but looks off: spacing, hierarchy and typography feel inconsistent. Do a design review of it.

```tsx
export const Settings = () => (
  <div style={{ padding: 13 }}>
    <h1 style={{ fontSize: 17 }}>Settings</h1>
    <h3 style={{ fontSize: 22, marginTop: 5 }}>Profile</h3>
    <label style={{ marginLeft: 7 }}>Name <input style={{ borderRadius: 3 }} /></label>
    <button style={{ background: '#3b82f6', padding: '4px 9px', marginTop: 31 }}>save</button>
    <h3 style={{ fontSize: 19, marginTop: 40 }}>Notifications</h3>
  </div>
)
```
