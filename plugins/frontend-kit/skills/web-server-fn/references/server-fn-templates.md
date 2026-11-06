# Server function templates

Verified against `@tanstack/react-start` 1.169 (`createServerFn` with
`.validator()`, `useServerFn`, `createMiddleware`, `createServerOnlyFn`,
`createIsomorphicFn`; request helpers from `@tanstack/react-start/server`:
`getRequest`, `getRequestHeader`, `getCookie`, `setCookie`, `deleteCookie`,
`setResponseHeader(s)`, `setResponseStatus`). Names are examples.

## `server/contact.schemas.ts` (client-safe)

```ts
import { z } from 'zod'

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'contact.nameRequired').max(80),
  email: z.email('contact.emailInvalid').max(254),
  message: z.string().trim().min(10, 'contact.messageTooShort').max(2000),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
```

The same schema drives the form (`zodResolver(contactMessageSchema)`), so
client and server reject the same input.

## `server/contact.server.ts` (server-only)

```ts
import { serverEnv } from '@/shared/server/env.server'

import type { ContactMessageInput } from './contact.schemas'

export async function sendContactMessage(input: ContactMessageInput): Promise<{ ticketId: string }> {
  const { CONTACT_API_URL, CONTACT_API_KEY } = serverEnv()
  const response = await fetch(`${CONTACT_API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CONTACT_API_KEY}` },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error('contact.sendFailed')
  const body: unknown = await response.json()
  return parseTicket(body) // zod parse of the backend answer; never trust it blindly
}
```

## `server/contact.functions.ts` (import anywhere)

```ts
import { createServerFn } from '@tanstack/react-start'

import { contactMessageSchema } from './contact.schemas'
import { sendContactMessage } from './contact.server'

export const submitContactMessage = createServerFn({ method: 'POST' })
  .validator(contactMessageSchema)
  .handler(async ({ data }) => sendContactMessage(data))
```

## A private read with the session cookie

```ts
// account.server.ts
import { getCookie } from '@tanstack/react-start/server'

export async function requireSession() {
  const token = getCookie(SESSION_COOKIE)
  if (!token) throw redirect({ to: '/login' })
  return verifySession(token) // backend or JWT check; throws redirect when invalid
}

// account.functions.ts
export const getMyOrders = createServerFn({ method: 'GET' })
  .validator(z.object({ page: z.number().int().min(1).max(500) }))
  .handler(async ({ data }) => {
    const session = await requireSession()
    setResponseHeaders(new Headers({ 'Cache-Control': 'private, no-store' }))
    return fetchOrdersForUser(session.userId, data.page) // scoped to this user, always
  })
```

Shared auth checks can be a `createMiddleware({ type: 'function' })` passed
with `.middleware([authMiddleware])`; the handler still checks that the
resource belongs to the caller.

## Read as a query

```ts
export const myOrdersQueryOptions = (page: number) =>
  queryOptions({
    queryKey: qk.account.orders(page),
    queryFn: () => getMyOrders({ data: { page } }),
    staleTime: 0,
  })
```

## Write as a mutation

```ts
// hooks/query/use-submit-contact-message.ts
export function useSubmitContactMessage() {
  const submit = useServerFn(submitContactMessage)
  return useMutation({
    mutationFn: (input: ContactMessageInput) => submit({ data: input }),
    meta: { successMessage: 'contact.sent' },
  })
}
```

`useServerFn` lets a thrown `redirect` / `notFound` from the handler move
the router. The page hook owns the form, the single-flight guard and the
navigation after success.

## Server-only and isomorphic helpers

- `createServerOnlyFn(() => …)`: a helper that must never run in the
  browser (throws there). Good for `serverEnv()`.
- `createIsomorphicFn().server(() => …).client(() => …)`: one call, two
  implementations — e.g. the initial language (cookie on the server,
  `<html lang>` in the browser).

## Tests

```ts
describe('submitContactMessage schema', () => {
  it('rejects a short message with an i18n key', () => {
    const result = contactMessageSchema.safeParse({ name: 'Ali', email: 'a@b.co', message: 'hi' })
    expect(result.success).toBe(false)
  })
})

describe('sendContactMessage', () => {
  it('maps a backend failure to a safe error', async () => {
    server.use(http.post(`${TEST_CONTACT_API}/messages`, () => HttpResponse.json({}, { status: 500 })))
    await expect(sendContactMessage(validInput)).rejects.toThrow('contact.sendFailed')
  })
})
```
