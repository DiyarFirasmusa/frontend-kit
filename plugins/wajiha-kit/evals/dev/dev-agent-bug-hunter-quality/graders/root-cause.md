---
type: llm
---

PASS if the answer says the start index is off by one (should be (page - 1) * pageSize for 1-based pages, or page * pageSize for 0-based) and proposes a corrected expression and a test.
FAIL if it blames something else or gives no fix.
