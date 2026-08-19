import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getEnv } from './env';
import { logger } from './logger';
import type { QuoteInput } from './validations';

export type SendOutcome =
  | { ok: true; transport: 'resend' | 'smtp'; attempts: number }
  | { ok: false; reason: 'not-configured'; attempts: 0 }
  | { ok: false; reason: 'send-failed'; attempts: number; error: string };

const FIELD_LABELS: Array<[keyof QuoteInput, string]> = [
  ['fullName', 'Full name'],
  ['company', 'Company'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['buyerType', 'Buyer type'],
  ['productInterest', 'Product interest'],
  ['quantity', 'Quantity / volume'],
  ['destinationCountry', 'Destination country'],
  ['needSpecs', 'Wants specification docs'],
];

/**
 * Render the quote as readable text. The previous implementation sent
 * `JSON.stringify(payload, null, 2)` — technically the data, but nobody wants
 * to read a lead as a JSON blob on a phone.
 */
export function renderQuoteEmail(quote: QuoteInput): { subject: string; text: string } {
  const lines = FIELD_LABELS.map(([key, label]) => {
    const value = quote[key];
    const rendered = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? '');
    return `${label.padEnd(24)} ${rendered}`;
  });

  const text = [
    'New quote request from orvixllc.com',
    '',
    ...lines,
    '',
    'Message',
    '-------',
    quote.message,
    '',
    `Reply directly to this email to reach ${quote.fullName} at ${quote.email}.`,
  ].join('\n');

  return {
    subject: `Quote request — ${quote.productInterest} — ${quote.company}`,
    text,
  };
}

async function deliver(quote: QuoteInput): Promise<'resend' | 'smtp'> {
  const env = getEnv();
  const { subject, text } = renderQuoteEmail(quote);
  const to = env.contactToEmail;
  const from = env.contactFromEmail!;

  if (env.transport === 'resend') {
    const resend = new Resend(env.resendApiKey!);
    const result = await resend.emails.send({
      to,
      from,
      subject,
      text,
      replyTo: quote.email,
    });
    // The Resend SDK resolves with { data, error } rather than throwing on
    // API-level failures, so an unchecked call reports success on a 4xx.
    if (result.error) {
      throw new Error(`Resend rejected the message: ${result.error.message ?? 'unknown error'}`);
    }
    return 'resend';
  }

  if (env.transport === 'smtp') {
    const transporter = nodemailer.createTransport({
      host: env.smtp!.host,
      port: env.smtp!.port,
      secure: env.smtp!.port === 465,
      auth: { user: env.smtp!.user, pass: env.smtp!.pass },
    });
    await transporter.sendMail({ to, from, subject, text, replyTo: quote.email });
    return 'smtp';
  }

  throw new Error('No email transport configured.');
}

/**
 * Send a quote request, retrying once on failure.
 *
 * Never throws — the caller gets a typed outcome so the route can decide the
 * status code and whether to write a recovery record.
 */
export async function sendQuoteEmail(quote: QuoteInput): Promise<SendOutcome> {
  const env = getEnv();

  if (env.transport === 'none') {
    logger.error({
      event: 'email.not_configured',
      detail: 'No email provider configured; quote cannot be delivered.',
    });
    return { ok: false, reason: 'not-configured', attempts: 0 };
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const transport = await deliver(quote);
      logger.info({ event: 'email.sent', transport, attempt });
      return { ok: true, transport, attempts: attempt };
    } catch (error) {
      lastError = error;
      logger.warn({
        event: 'email.attempt_failed',
        attempt,
        transport: env.transport,
        error: error instanceof Error ? error.message : String(error),
      });
      // Brief pause before the single retry; most transient SMTP/API failures
      // clear within a second.
      if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  logger.error({ event: 'email.send_failed', transport: env.transport, attempts: 2, error: message });
  return { ok: false, reason: 'send-failed', attempts: 2, error: message };
}
