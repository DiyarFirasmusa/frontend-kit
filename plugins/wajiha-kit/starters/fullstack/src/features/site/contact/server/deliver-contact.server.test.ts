import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deliverContact } from './deliver-contact.server';

const input = {
  name: 'Sara',
  email: 'sara@example.com',
  phone: '',
  message: 'A message long enough to pass.',
  contactRef: '',
};

const webhook = { CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x', productionSite: true };

let errorLog: ReturnType<typeof vi.spyOn>;
let warnLog: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  warnLog = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Everything written to the server log, as one string. */
const logged = () => JSON.stringify([...errorLog.mock.calls, ...warnLog.mock.calls]);

describe('deliverContact', () => {
  it('accepts and discards the message without a webhook on a staging copy (demo mode), with a log line', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await deliverContact(input, { productionSite: false })).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(logged()).toContain('demo mode');
  });

  it('refuses to discard on the real site: no webhook is a failure the visitor sees', async () => {
    vi.stubGlobal('fetch', vi.fn());
    expect(await deliverContact(input, { productionSite: true })).toBe(false);
    expect(logged()).toContain('CONTACT_WEBHOOK_URL is not set');
  });

  it('posts the message as JSON to the webhook, without the honeypot field', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    expect(await deliverContact(input, webhook)).toBe(true);
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

  it('reports and logs a webhook error status, without the message or the webhook URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    expect(await deliverContact(input, webhook)).toBe(false);
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(logged()).toContain('502');
    expect(logged()).not.toContain('sara@example.com');
    expect(logged()).not.toContain('hooks.example.test');
  });

  it('reports and logs an unreachable webhook with the error code only', async () => {
    const down = new TypeError('fetch failed https://hooks.example.test/x', {
      cause: { code: 'ECONNREFUSED' },
    });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(down));
    expect(await deliverContact(input, webhook)).toBe(false);
    expect(logged()).toContain('ECONNREFUSED');
    expect(logged()).not.toContain('hooks.example.test');
  });

  it('a honeypot hit looks like a success but delivers nothing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await deliverContact({ ...input, contactRef: 'http://spam.example' }, webhook);
    expect(result).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
