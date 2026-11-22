---
type: llm
---

PASS if the final answer reports at least three of these five, each tied to a file and line or to the code shown: (1) the server function reads an order by id with no check of who is calling (no authorisation), (2) the admin token is read from process.env inside a server function that a client can call, or the function returns the backend response unchecked (accept either), (3) dangerouslySetInnerHTML renders unsanitised HTML, (4) the access token is stored in localStorage, (5) VITE_ADMIN_API_KEY, a VITE_ prefixed variable, is read in browser code and so ships to the client, and (6) the `next` search parameter goes into navigate without a same-origin check (open redirect).
FAIL otherwise. A finding that is not backed by the code shown does not count.
