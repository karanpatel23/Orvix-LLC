import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AppEnv } from '@/lib/env';
import type { QuoteInput } from '@/lib/validations';

const sendMailMock = vi.fn();
const resendSendMock = vi.fn();
let currentEnv: AppEnv;

vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: sendMailMock }) },
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: resendSendMock };
  },
}));

vi.mock('@/lib/env', () => ({
  getEnv: () => currentEnv,
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  persistUnsentLead: vi.fn(),
}));

const { sendQuoteEmail, renderQuoteEmail } = await import('@/lib/email');

const quote: QuoteInput = {
  fullName: 'Karan Patel',
  company: 'ORVIX LLC',
  email: 'buyer@example.com',
  phone: '+1 919 555 0100',
  buyerType: 'Industrial Buyer',
  productInterest: 'Silica Sand',
  quantity: '25 MT',
  destinationCountry: 'India',
  message: 'Please share mesh range and packaging options.',
  needSpecs: true,
};

const baseEnv: AppEnv = {
  contactToEmail: 'info@orvixllc.com',
  contactFromEmail: 'quotes@orvixllc.com',
  transport: 'resend',
  resendApiKey: 're_test',
  nodeEnv: 'test',
};

beforeEach(() => {
  vi.clearAllMocks();
  currentEnv = { ...baseEnv };
  resendSendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
  sendMailMock.mockResolvedValue({ messageId: 'msg_1' });
});

describe('renderQuoteEmail', () => {
  it('produces a subject naming the product and company', () => {
    const { subject } = renderQuoteEmail(quote);
    expect(subject).toContain('Silica Sand');
    expect(subject).toContain('ORVIX LLC');
  });

  it('includes every submitted field in the body', () => {
    const { text } = renderQuoteEmail(quote);
    expect(text).toContain('Karan Patel');
    expect(text).toContain('buyer@example.com');
    expect(text).toContain('25 MT');
    expect(text).toContain('India');
    expect(text).toContain('Please share mesh range');
  });

  it('renders the needSpecs boolean as Yes/No rather than true/false', () => {
    expect(renderQuoteEmail(quote).text).toContain('Yes');
    expect(renderQuoteEmail({ ...quote, needSpecs: false }).text).toContain('No');
  });

  it('is not a JSON blob', () => {
    const { text } = renderQuoteEmail(quote);
    expect(text.trim().startsWith('{')).toBe(false);
  });
});

describe('sendQuoteEmail - not configured', () => {
  it('returns not-configured without attempting a send', async () => {
    currentEnv = { ...baseEnv, transport: 'none', resendApiKey: undefined };
    const outcome = await sendQuoteEmail(quote);
    expect(outcome).toEqual({ ok: false, reason: 'not-configured', attempts: 0 });
    expect(resendSendMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});

describe('sendQuoteEmail - resend transport', () => {
  it('sends successfully on the first attempt', async () => {
    const outcome = await sendQuoteEmail(quote);
    expect(outcome).toEqual({ ok: true, transport: 'resend', attempts: 1 });
    expect(resendSendMock).toHaveBeenCalledTimes(1);
  });

  it('sets replyTo to the buyer so a reply reaches them directly', async () => {
    await sendQuoteEmail(quote);
    expect(resendSendMock.mock.calls[0][0]).toMatchObject({ replyTo: 'buyer@example.com' });
  });

  it('addresses the configured recipient and sender', async () => {
    await sendQuoteEmail(quote);
    expect(resendSendMock.mock.calls[0][0]).toMatchObject({
      to: 'info@orvixllc.com',
      from: 'quotes@orvixllc.com',
    });
  });

  it('treats an API-level error object as a failure, not a success', async () => {
    resendSendMock.mockResolvedValue({ data: null, error: { message: 'domain not verified' } });
    const outcome = await sendQuoteEmail(quote);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok && outcome.reason === 'send-failed') {
      expect(outcome.error).toContain('domain not verified');
    }
  });

  it('retries exactly once on a thrown error, then gives up', async () => {
    resendSendMock.mockRejectedValue(new Error('network down'));
    const outcome = await sendQuoteEmail(quote);
    expect(resendSendMock).toHaveBeenCalledTimes(2);
    expect(outcome).toMatchObject({ ok: false, reason: 'send-failed', attempts: 2 });
  });

  it('succeeds on the retry when the first attempt fails transiently', async () => {
    resendSendMock
      .mockRejectedValueOnce(new Error('transient 503'))
      .mockResolvedValueOnce({ data: { id: 'msg_2' }, error: null });
    const outcome = await sendQuoteEmail(quote);
    expect(outcome).toEqual({ ok: true, transport: 'resend', attempts: 2 });
  });

  it('never throws, even when the provider throws a non-Error value', async () => {
    resendSendMock.mockRejectedValue('a string rejection');
    await expect(sendQuoteEmail(quote)).resolves.toMatchObject({ ok: false });
  });
});

describe('sendQuoteEmail - smtp transport', () => {
  beforeEach(() => {
    currentEnv = {
      ...baseEnv,
      transport: 'smtp',
      resendApiKey: undefined,
      smtp: { host: 'smtp.example.com', port: 587, user: 'u', pass: 'p' },
    };
  });

  it('sends via nodemailer', async () => {
    const outcome = await sendQuoteEmail(quote);
    expect(outcome).toEqual({ ok: true, transport: 'smtp', attempts: 1 });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });

  it('retries once then reports failure', async () => {
    sendMailMock.mockRejectedValue(new Error('connection refused'));
    const outcome = await sendQuoteEmail(quote);
    expect(sendMailMock).toHaveBeenCalledTimes(2);
    expect(outcome).toMatchObject({ ok: false, reason: 'send-failed' });
  });
});
