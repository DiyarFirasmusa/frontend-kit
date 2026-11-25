import { describe, expect, it } from 'vitest';
import {
  defaultLoginForm,
  loginSchema,
} from '@/features/auth/login/validations/validations';

describe('loginSchema', () => {
  it('rejects an empty username with the usernameRequired key', () => {
    const result = loginSchema.safeParse({ username: '', password: 'x' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'username');
      expect(issue?.message).toBe('login.usernameRequired');
    }
  });

  it('rejects a whitespace-only username with the usernameRequired key', () => {
    const result = loginSchema.safeParse({ username: '   ', password: 'x' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'username');
      expect(issue?.message).toBe('login.usernameRequired');
    }
  });

  it('trims a padded username so the parsed value is what gets posted', () => {
    const result = loginSchema.safeParse({
      username: ' admin ',
      password: 'secret',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe('admin');
    }
  });

  it('rejects an empty password with the passwordRequired key', () => {
    const result = loginSchema.safeParse({ username: 'admin', password: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'password');
      expect(issue?.message).toBe('login.passwordRequired');
    }
  });

  it('accepts a filled-in username and password', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      password: 'secret',
    });

    expect(result.success).toBe(true);
  });

  it('defaultLoginForm has the LoginFormData shape (both fields empty, unvalidated)', () => {
    // The default values are the unfilled state of the form, not a valid
    // submission — they intentionally fail the required-field validation.
    expect(defaultLoginForm).toEqual({ username: '', password: '' });
    const result = loginSchema.safeParse(defaultLoginForm);
    expect(result.success).toBe(false);
  });
});
