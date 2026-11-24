---
name: info-agent-implicit-accessibility-auditor
description: The accessibility-auditor agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Audit this checkout form for WCAG 2.2 AA: keyboard, screen readers and contrast, in Arabic RTL and English LTR.

```tsx
export const Checkout = () => (
  <form>
    <input placeholder="Phone" type="text" />
    <select><option>City</option></select>
    <div className="btn" onClick={submit} style={{ color: '#bbb', background: '#fff' }}>Pay</div>
    <p style={{ color: 'red' }}>Invalid phone</p>
  </form>
)
```
