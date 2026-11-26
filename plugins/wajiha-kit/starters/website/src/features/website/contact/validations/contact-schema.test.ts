import { describe, expect, it } from 'vitest';
import {
  CONTACT_MESSAGES,
  contactSchema,
  EMPTY_CONTACT,
  isContactMessage,
  toAsciiDigits,
} from './contact-schema';

const valid = {
  name: 'Sara Ali',
  email: 'sara@example.com',
  phone: '+964 770 000 0000',
  message: 'Hello, I would like to ask about training.',
  contactRef: '',
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

  it('accepts phone numbers typed with Arabic-Indic or Eastern Arabic digits, and stores them as 0-9', () => {
    expect(contactSchema.parse({ ...valid, phone: '٠٧٧٠١٢٣٤٥٦٧' }).phone).toBe('07701234567');
    expect(contactSchema.parse({ ...valid, phone: '+۹۶۴ ۷۷۰ ۱۲۳ ۴۵۶۷' }).phone).toBe(
      '+964 770 123 4567',
    );
  });

  it('accepts common phone formatting and rejects letters or too few digits', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '(770) 123-4567' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, phone: '0770.123.4567' }).success).toBe(true);
    expect(messagesFor({ phone: '12345' })).toEqual(['contact.phoneInvalid']);
    expect(messagesFor({ phone: '0770 abc 4567' })).toEqual(['contact.phoneInvalid']);
    expect(messagesFor({ phone: '++9647701234567' })).toEqual(['contact.phoneInvalid']);
  });

  it('toAsciiDigits leaves other characters alone', () => {
    expect(toAsciiDigits('٠١٢٣٤٥٦٧٨٩ ۰۱۲۳۴۵۶۷۸۹ +-')).toBe('0123456789 0123456789 +-');
  });

  it('starts empty', () => {
    expect(contactSchema.safeParse(EMPTY_CONTACT).success).toBe(false);
  });
});

describe('error messages are typed locale keys', () => {
  const bad = [
    EMPTY_CONTACT,
    {
      name: 'x'.repeat(81),
      email: `${'a'.repeat(250)}@x.io`,
      phone: '1'.repeat(21),
      message: 'm'.repeat(2001),
      contactRef: '',
    },
    {
      name: 'Ali',
      email: 'not-an-email',
      phone: 'abc',
      message: 'long enough message',
      contactRef: '',
    },
  ];

  it('every message the schema returns is one of CONTACT_MESSAGES, and each is reachable', () => {
    const seen = new Set<string>();
    for (const input of bad) {
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      for (const issue of result.error?.issues ?? []) {
        expect(isContactMessage(issue.message), issue.message).toBe(true);
        seen.add(issue.message);
      }
    }
    expect([...seen].toSorted()).toEqual([...CONTACT_MESSAGES].toSorted());
  });

  it('isContactMessage rejects any other string', () => {
    expect(isContactMessage('contact.nope')).toBe(false);
    expect(isContactMessage(undefined)).toBe(false);
  });
});
