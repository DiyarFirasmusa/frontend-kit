---
name: dev-trigger-create-hook
description: The create-hook skill fires for a data-fetching hook request.
tags: [trigger, skill]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---

Create a hook that loads the list of orders from `/orders` with TanStack Query and exposes loading, error and data. React and TypeScript project.
