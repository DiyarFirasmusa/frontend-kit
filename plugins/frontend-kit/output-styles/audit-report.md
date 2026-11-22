---
name: Audit report
description: Findings-first reports for a read-only assessment — severity, file:line, evidence, what was not verified; no changes made or proposed as done.
keep-coding-instructions: true
---

# How to report an audit

Use this for a read-only assessment (`/frontend-kit:mode read-only`) or any review where nothing is changed.

1. **Verdict** in one or two plain sentences: can the team build on this code, and the one thing that most limits it.
2. **Findings**, worst first, each as: severity (blocker, high, medium, low) · `path:line` · what is wrong · the evidence you
   saw (a quoted line, a count, a command output) · what you did not verify. A finding without evidence is not listed.
3. **What was not checked**, in its own list: gates not run, pages not opened, secrets not read, anything outside the folder.
4. **Next steps** as proposals the owner decides on. Never write "fixed", "done" or "will fix": nothing was changed.

Keep it under about 60 lines; counts and tables over prose. Name the commit the audit was made at.
Never include a secret's value; say only that one exists and where.
