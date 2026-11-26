import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { useLoginPage } from '@/features/auth/login/hooks/use-login-page';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { act, renderWithRouter, waitFor } from '@/test/render';

/** Renders `useLoginPage` inside a router + query context, exposing its
 * latest return value through the `latest` mutable box every re-render. */
function LoginPageProbe({
  latest,
}: {
  latest: { current: ReturnType<typeof useLoginPage> | null };
}) {
  latest.current = useLoginPage();
  return null;
}

async function mountProbe(initialEntries?: string[]) {
  const latest: { current: ReturnType<typeof useLoginPage> | null } = {
    current: null,
  };
  const { router } = await renderWithRouter(
    <LoginPageProbe latest={latest} />,
    { initialEntries },
  );
  return Object.assign(latest, { router });
}

function fillForm(
  latest: ReturnType<typeof useLoginPage>,
  username: string,
  password: string,
) {
  act(() => {
    latest.form.setValue('username', username);
    latest.form.setValue('password', password);
  });
}

/** Submits the form and flushes the resolver's validation microtask so the
 * mutation's `isPending` transition is observable right after this resolves. */
async function submitForm(latest: ReturnType<typeof useLoginPage>) {
  await act(async () => {
    await latest.onSubmit();
  });
}

describe('useLoginPage', () => {
  it('tracks the mutation pending state through a failed request', async () => {
    let finish: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    server.use(
      http.post(authApi(endpoints.auth.login), async () => {
        await pending;
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      }),
    );
    const latest = await mountProbe();
    fillForm(latest.current!, 'admin', 'secret');
    await submitForm(latest.current!);
    await waitFor(() => {
      expect(latest.current!.isPending).toBe(true);
    });
    finish!();
    await waitFor(() => {
      expect(latest.current!.isPending).toBe(false);
    });
  });

  it.each([
    ['/?redirect=%2Fsuppliers%3Fq%3Dsteel', '/suppliers', { q: 'steel' }],
    ['/?redirect=%2F%2Fevil.example', '/', {}],
    ['/?redirect=https%3A%2F%2Fevil.example', '/', {}],
    ['/?redirect=%2F%5Cevil.example', '/', {}],
    ['/?redirect=%2Flogin', '/', {}],
  ])(
    'after signing in from %s lands on %s',
    async (entry, pathname, search) => {
      const latest = await mountProbe([entry]);
      fillForm(latest.current!, 'admin', 'secret');
      await submitForm(latest.current!);
      await waitFor(() => {
        expect(latest.router.state.location.pathname).toBe(pathname);
      });
      expect(latest.router.state.location.search).toEqual(search);
    },
  );
});
