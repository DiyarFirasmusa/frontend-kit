---
type: llm
---

PASS if the final answer reports at least three of these five, each tied to a file and line or to the code shown: (1) the server function reads an order by id with no check of who is calling (no authorisation), (2) dangerouslySetInnerHTML renders unsanitised HTML, (3) the access token is stored in localStorage, (4) VITE_ADMIN_API_KEY, a VITE_ prefixed variable named as an admin key, ships to the client, and (5) the `next` search parameter goes into navigate without a same-origin check (open redirect). Reading process.env inside the server function is correct and does not count as a finding.
FAIL otherwise. A finding that is not backed by the code shown does not count.
