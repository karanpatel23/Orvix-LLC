import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { quoteSchema, fieldErrors } from '@/lib/validations';
import { sendQuoteEmail } from '@/lib/email';
import { logger, persistUnsentLead } from '@/lib/logger';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIRECT_EMAIL = 'info@orvixllc.com';

export interface ContactResponse {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  retryAfter?: number;
  requestId?: string;
}

function json(body: ContactResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const started = Date.now();

  try {
    // --- 1. rate limit before doing any work -------------------------------
    const key = clientKey(req.headers);
    const limit = rateLimit(`contact:${key}`, { limit: 5, windowMs: 10 * 60 * 1000 });

    if (!limit.allowed) {
      logger.warn({ event: 'contact.rate_limited', requestId, retryAfter: limit.retryAfter });
      return json(
        {
          ok: false,
          message: `Too many requests. Please wait a few minutes and try again, or email ${DIRECT_EMAIL} directly.`,
          retryAfter: limit.retryAfter,
          requestId,
        },
        429,
        { 'Retry-After': String(limit.retryAfter) }
      );
    }

    // --- 2. parse the body (previously unguarded: malformed JSON threw) -----
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      logger.warn({ event: 'contact.malformed_body', requestId });
      return json(
        { ok: false, message: 'That request could not be read. Please try again.', requestId },
        400
      );
    }

    // --- 3. validate -------------------------------------------------------
    const parsed = quoteSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      logger.info({ event: 'contact.validation_failed', requestId, fields: Object.keys(errors) });
      return json(
        {
          ok: false,
          message: 'Please correct the highlighted fields and try again.',
          errors,
          requestId,
        },
        400
      );
    }

    // --- 4. honeypot: a human never fills this in --------------------------
    if (parsed.data.website) {
      logger.warn({ event: 'contact.honeypot_triggered', requestId });
      // Answer exactly like a success so the bot has no signal to adapt to.
      return json(
        { ok: true, message: 'Thank you. Your request has been received.', requestId },
        200
      );
    }

    const { website: _honeypot, ...quote } = parsed.data;

    // --- 5. deliver --------------------------------------------------------
    const outcome = await sendQuoteEmail(quote);

    if (outcome.ok) {
      logger.info({
        event: 'contact.delivered',
        requestId,
        transport: outcome.transport,
        attempts: outcome.attempts,
        durationMs: Date.now() - started,
        productInterest: quote.productInterest,
        buyerType: quote.buyerType,
      });
      return json(
        {
          ok: true,
          message:
            'Thank you. Your request has been received — ORVIX LLC will review your product interest and respond using the contact details provided.',
          requestId,
        },
        200
      );
    }

    // Delivery failed. Write the lead somewhere recoverable and tell the truth.
    persistUnsentLead({ requestId, ...quote }, outcome.reason);

    if (outcome.reason === 'not-configured') {
      logger.error({ event: 'contact.transport_unconfigured', requestId });
      return json(
        {
          ok: false,
          message: `We could not submit your request automatically. Please email ${DIRECT_EMAIL} directly — your details have not been sent.`,
          requestId,
        },
        503
      );
    }

    logger.error({
      event: 'contact.delivery_failed',
      requestId,
      attempts: outcome.attempts,
      error: outcome.error,
    });
    return json(
      {
        ok: false,
        message: `We could not deliver your request just now. Please try again in a moment, or email ${DIRECT_EMAIL} directly.`,
        requestId,
      },
      502
    );
  } catch (error) {
    // Anything unanticipated still leaves a trace and a typed response.
    logger.error({
      event: 'contact.unhandled_error',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      isZod: error instanceof ZodError,
    });
    return json(
      {
        ok: false,
        message: `Something went wrong on our side. Please email ${DIRECT_EMAIL} directly.`,
        requestId,
      },
      500
    );
  }
}

/** Anything other than POST gets a correct 405 rather than a Next.js default. */
export async function GET() {
  return json({ ok: false, message: 'Method not allowed.' }, 405, { Allow: 'POST' });
}
