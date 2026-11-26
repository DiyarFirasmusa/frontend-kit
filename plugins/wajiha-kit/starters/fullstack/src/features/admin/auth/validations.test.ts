import { describe, expect, it } from 'vitest';
import { loginSchema } from './validations';

describe('loginSchema', () => {
  it('accepts a user name and a password', () => {
    expect(loginSchema.safeParse({ username: ' demo ', password: 'x' })).toMatchObject({
      success: true,
      data: { username: 'demo' },
    });
  });

  it('reports each missing field with its own message key', () => {
    const result = loginSchema.safeParse({ username: '  ', password: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'login.usernameRequired',
      'login.passwordRequired',
    ]);
  });
});
