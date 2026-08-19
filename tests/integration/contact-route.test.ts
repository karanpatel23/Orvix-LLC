import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SendOutcome } from '@/lib/email';

const sendQuoteEmailMock = vi.fn<(input: unknown) => Promise<SendOutcome>>();
const persistUnsentLeadMock = vi.fn();
const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

vi.mock('@/lib/email', () => ({ sendQuoteEmail: sendQuoteEmailMock }));
vi.mock('@/lib/logger', () => ({
  logger: loggerMock,
  persistUnsentLead: persistUnsentLeadMock,
}));

const { POST, GET } = await import('@/app/api/contact/route');
const { resetRateLimit } = await import('@/lib/rate-limit');

const valid = {
  fullName: 'Karan Patel',
  company: 'ORVIX LLC',
  email: 'buyer@example.com',
  phone: '+1 919 555 0100',
  buyerType: 'Industrial Buyer',
  productInterest: 'Silica Sand',
  quantity: '25 MT',
  destinationCountry: 'India',
  message: 'Please share mesh range and packaging options for filtration grade.',
  needSpecs: true,
};

/** Each request gets a unique client IP so rate limiting does not bleed across tests. */
let ipCounter = 0;
function post(body: unknown, ip?: string) {
  ipCounter += 1;
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip ?? `10.0.0.${ipCounter % 250}`,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimit();
  ipCounter = 0;
  sendQuoteEmailMock.mockResolvedValue({ ok: true, transport: 'resend', attempts: 1 });
});

describe('POST /api/contact - happy path', () => {
  it('returns 200 and ok:true', async () => {
    const response = await POST(post(valid));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.message).toMatch(/received/i);
  });

  it('passes the validated quote to the email layer', async () => {
    await POST(post(valid));
    expect(sendQuoteEmailMock).toHaveBeenCalledTimes(1);
    expect(sendQuoteEmailMock.mock.calls[0][0]).toMatchObject({
      fullName: 'Karan Patel',
      email: 'buyer@example.com',
      productInterest: 'Silica Sand',
    });
  });

  it('strips the honeypot field before it reaches the email layer', async () => {
    await POST(post({ ...valid, website: '' }));
    expect(sendQuoteEmailMock.mock.calls[0][0]).not.toHaveProperty('website');
  });

  it('returns a requestId for log correlation', async () => {
    const body = await (await POST(post(valid))).json();
    expect(typeof body.requestId).toBe('string');
    expect(body.requestId.length).toBeGreaterThan(0);
  });
});

describe('POST /api/contact - validation failures', () => {
  it('returns 400 with per-field errors', async () => {
    const response = await POST(post({ ...valid, email: 'nope', fullName: '' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.errors).toHaveProperty('email');
    expect(body.errors).toHaveProperty('fullName');
  });

  it('does not attempt delivery when validation fails', async () => {
    await POST(post({ ...valid, email: 'nope' }));
    expect(sendQuoteEmailMock).not.toHaveBeenCalled();
  });

  it('returns 400 for an empty object', async () => {
    expect((await POST(post({}))).status).toBe(400);
  });

  it('returns 400 for an oversized message rather than emailing it', async () => {
    const response = await POST(post({ ...valid, message: 'a'.repeat(50_000) }));
    expect(response.status).toBe(400);
    expect(sendQuoteEmailMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a wrong-typed field', async () => {
    expect((await POST(post({ ...valid, fullName: 12345 }))).status).toBe(400);
  });
});

describe('POST /api/contact - malformed body', () => {
  it('returns 400 rather than throwing on invalid JSON', async () => {
    const response = await POST(post('{not valid json'));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('returns 400 on an empty body', async () => {
    expect((await POST(post(''))).status).toBe(400);
  });

  it('returns 400 on a JSON array body', async () => {
    expect((await POST(post([valid]))).status).toBe(400);
  });

  it('never invokes the email layer for a malformed body', async () => {
    await POST(post('{broken'));
    expect(sendQuoteEmailMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/contact - honeypot', () => {
  it('returns a 200 that is indistinguishable from success', async () => {
    const response = await POST(post({ ...valid, website: 'http://spam.example' }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  it('sends no email when the honeypot is filled', async () => {
    await POST(post({ ...valid, website: 'http://spam.example' }));
    expect(sendQuoteEmailMock).not.toHaveBeenCalled();
  });

  it('does not persist a bot submission as a recoverable lead', async () => {
    await POST(post({ ...valid, website: 'http://spam.example' }));
    expect(persistUnsentLeadMock).not.toHaveBeenCalled();
  });

  it('still delivers when the honeypot is present but empty', async () => {
    await POST(post({ ...valid, website: '' }));
    expect(sendQuoteEmailMock).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/contact - rate limiting', () => {
  it('allows 5 submissions from one client then blocks the 6th', async () => {
    const ip = '203.0.113.50';
    for (let i = 0; i < 5; i += 1) {
      expect((await POST(post(valid, ip))).status).toBe(200);
    }
    const blocked = await POST(post(valid, ip));
    expect(blocked.status).toBe(429);
  });

  it('sets a Retry-After header when blocked', async () => {
    const ip = '203.0.113.51';
    for (let i = 0; i < 6; i += 1) await POST(post(valid, ip));
    const blocked = await POST(post(valid, ip));
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('does not attempt delivery for a blocked request', async () => {
    const ip = '203.0.113.52';
    for (let i = 0; i < 5; i += 1) await POST(post(valid, ip));
    sendQuoteEmailMock.mockClear();
    await POST(post(valid, ip));
    expect(sendQuoteEmailMock).not.toHaveBeenCalled();
  });

  it('limits per client, not globally', async () => {
    for (let i = 0; i < 6; i += 1) await POST(post(valid, '203.0.113.60'));
    expect((await POST(post(valid, '203.0.113.61'))).status).toBe(200);
  });
});

describe('POST /api/contact - delivery failures', () => {
  it('returns 503 when no transport is configured', async () => {
    sendQuoteEmailMock.mockResolvedValue({ ok: false, reason: 'not-configured', attempts: 0 });
    const response = await POST(post(valid));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.message).toContain('info@orvixllc.com');
  });

  it('persists the lead when the transport is unconfigured', async () => {
    sendQuoteEmailMock.mockResolvedValue({ ok: false, reason: 'not-configured', attempts: 0 });
    await POST(post(valid));
    expect(persistUnsentLeadMock).toHaveBeenCalledTimes(1);
    expect(persistUnsentLeadMock.mock.calls[0][0]).toMatchObject({ email: 'buyer@example.com' });
  });

  it('returns 502 when delivery fails after the retry', async () => {
    sendQuoteEmailMock.mockResolvedValue({
      ok: false,
      reason: 'send-failed',
      attempts: 2,
      error: 'smtp timeout',
    });
    expect((await POST(post(valid))).status).toBe(502);
  });

  it('persists the lead when delivery fails', async () => {
    sendQuoteEmailMock.mockResolvedValue({
      ok: false,
      reason: 'send-failed',
      attempts: 2,
      error: 'smtp timeout',
    });
    await POST(post(valid));
    expect(persistUnsentLeadMock).toHaveBeenCalledTimes(1);
  });

  it('never reports success when delivery failed', async () => {
    sendQuoteEmailMock.mockResolvedValue({ ok: false, reason: 'not-configured', attempts: 0 });
    const body = await (await POST(post(valid))).json();
    expect(body.ok).toBe(false);
    expect(body.message).not.toMatch(/thank you/i);
  });

  it('returns 500 and logs when the email layer throws unexpectedly', async () => {
    sendQuoteEmailMock.mockRejectedValue(new Error('boom'));
    const response = await POST(post(valid));
    expect(response.status).toBe(500);
    expect(loggerMock.error).toHaveBeenCalled();
  });
});

describe('GET /api/contact', () => {
  it('returns 405 with an Allow header', async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });
});
