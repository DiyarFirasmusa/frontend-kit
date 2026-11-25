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

async function mountProbe() {
  const latest: { current: ReturnType<typeof useLoginPage> | null } = {
    current: null,
  };
  await renderWithRouter(<LoginPageProbe latest={latest} />);
  return latest;
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
});
