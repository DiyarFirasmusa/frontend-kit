import { isRedirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { signIn } from '@/test/fixtures/auth';
import { Route as AuthRoute } from '../route';
import { Route as LoginRoute } from './index';

function runGuard(beforeLoad: (() => void) | undefined): unknown {
  try {
    beforeLoad?.();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('/_auth route guard (login)', () => {
  it('redirects a signed-in user away from /login to home', () => {
    signIn();
    const thrown = runGuard(AuthRoute.options.beforeLoad as () => void);
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/' } });
  });

  it('lets a signed-out visitor reach /login', () => {
    expect(
      runGuard(AuthRoute.options.beforeLoad as () => void),
    ).toBeUndefined();
  });

  it('keeps its own requireGuest on the /login child route', () => {
    signIn();
    const thrown = runGuard(LoginRoute.options.beforeLoad as () => void);
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/' } });
  });
});
