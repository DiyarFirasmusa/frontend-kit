import { describe, expect, it } from 'vitest';
import { contactSchema, EMPTY_CONTACT, toAsciiDigits } from './contact-schema';

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
