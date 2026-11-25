import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverContact } from './deliver-contact.server';

const input = {
  name: 'Sara',
  email: 'sara@example.com',
  phone: '',
  message: 'A message long enough to pass.',
  website: '',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('deliverContact', () => {
  it('accepts and discards the message when no webhook is configured (demo mode)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await deliverContact(input, {})).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the message as JSON to the webhook, without the honeypot field', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    expect(
      await deliverContact(input, { CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' }),
    ).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://hooks.example.test/x');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      name: 'Sara',
      email: 'sara@example.com',
      phone: '',
      message: 'A message long enough to pass.',
    });
  });

  it('reports failure when the webhook answers with an error or is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(
      await deliverContact(input, { CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' }),
    ).toBe(false);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(
      await deliverContact(input, { CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' }),
    ).toBe(false);
  });

  it('a honeypot hit looks like a success but delivers nothing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await deliverContact(
      { ...input, website: 'http://spam.example' },
      { CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' },
    );
    expect(result).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
