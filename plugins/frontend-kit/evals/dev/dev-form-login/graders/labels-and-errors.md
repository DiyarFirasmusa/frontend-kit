---
type: llm
---

PASS if every input has a visible label or aria-label, validation errors are shown next to the field (not only in a toast),
the submit is protected against double submit (disabled or ignored while pending), and user-facing text goes through
translation keys instead of hardcoded strings.
FAIL if any of these is missing.
