import { describe, expect, it } from 'vitest';
import { EMPTY_PROFILE, profileSchema } from './validations';

function issues(values: Partial<typeof EMPTY_PROFILE>): string[] {
  const result = profileSchema.safeParse({ ...EMPTY_PROFILE, ...values });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('profileSchema', () => {
  it('needs a name; e-mail and job title are optional', () => {
    expect(issues({})).toEqual(['settings.nameRequired']);
    expect(issues({ name: 'Demo Admin' })).toEqual([]);
  });

  it('checks the e-mail only when one is typed, and the lengths', () => {
    expect(issues({ name: 'A', email: 'nope' })).toEqual(['settings.emailInvalid']);
    expect(issues({ name: 'x'.repeat(121), jobTitle: 'y'.repeat(121) })).toEqual([
      'settings.nameMax',
      'settings.jobTitleMax',
    ]);
  });
});
