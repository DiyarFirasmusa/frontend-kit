import { describe, expect, it } from 'vitest';
import { contactSchema, EMPTY_CONTACT } from './contact-schema';

const valid = {
  name: 'Sara Ali',
  email: 'sara@example.com',
  phone: '+964 770 000 0000',
  message: 'Hello, I would like to ask about training.',
  website: '',
};

function messagesFor(input: Partial<typeof valid>): string[] {
  const result = contactSchema.safeParse({ ...valid, ...input });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('contactSchema', () => {
  it('accepts a complete message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('phone is optional', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '' }).success).toBe(true);
  });

  it('trims whitespace before checking', () => {
    expect(messagesFor({ name: '   ' })).toContain('contact.nameRequired');
    expect(contactSchema.parse({ ...valid, name: '  Sara  ' }).name).toBe('Sara');
  });

  it('reports locale keys, not text', () => {
    expect(messagesFor({ name: 'S' })).toEqual(['contact.nameRequired']);
    expect(messagesFor({ name: 'x'.repeat(81) })).toEqual(['contact.nameTooLong']);
    expect(messagesFor({ email: 'not-an-email' })).toEqual(['contact.emailInvalid']);
    expect(messagesFor({ phone: 'abc' })).toEqual(['contact.phoneInvalid']);
    expect(messagesFor({ message: 'short' })).toEqual(['contact.messageTooShort']);
    expect(messagesFor({ message: 'x'.repeat(2001) })).toEqual(['contact.messageTooLong']);
  });

  it('starts empty', () => {
    expect(contactSchema.safeParse(EMPTY_CONTACT).success).toBe(false);
  });
});
