---
name: dev-trigger-create-store
description: The create-store skill fires for a global client-state request.
tags: [trigger, skill]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---

Add a global store for the user's theme preference (light, dark, system) that survives a page reload. The project uses React and TypeScript.
