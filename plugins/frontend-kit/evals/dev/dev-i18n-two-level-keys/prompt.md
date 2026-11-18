---
name: dev-i18n-two-level-keys
description: Translation keys are two-level and added to both languages.
tags: [i18n, skill]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---

Add a "Save changes" button to this component and make it translatable. The app uses react-i18next with Arabic and English.

```tsx
export const ProfileActions = () => (
  <div className="flex gap-2">
    <button type="button">Cancel</button>
  </div>
)
```
