import { z } from 'zod';

/**
 * Environment schema.
 *
 * Two failure modes are deliberately treated differently:
 *
 * 1. INCOHERENT config (e.g. RESEND_API_KEY set but CONTACT_FROM_EMAIL missing)
 *    throws at module load. This is always a mistake, and it is the specific trap
 *    that made the old code look configured while silently sending nothing.
 *    Throwing here fails `next build`, so Vercel refuses to promote the deploy
 *    and the previous good version stays live.
 *
 * 2. NO email provider configured at all is a legitimate state for local dev and
 *    CI. It does not throw — it marks the transport unavailable, so the contact
 *    route can answer honestly (503) and still write the lead to a recoverable
 *    log line instead of pretending to succeed.
 */

const optionalString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .catch(undefined);

const rawSchema = z.object({
  RESEND_API_KEY: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().max(65535).default(587).catch(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  CONTACT_TO_EMAIL: z.string().trim().email().default('info@orvixllc.com').catch('info@orvixllc.com'),
  CONTACT_FROM_EMAIL: z.string().trim().email().optional().catch(undefined),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type EmailTransport = 'resend' | 'smtp' | 'none';

export interface AppEnv {
  resendApiKey?: string;
  smtp?: { host: string; port: number; user: string; pass: string };
  contactToEmail: string;
  contactFromEmail?: string;
  transport: EmailTransport;
  nodeEnv: 'development' | 'test' | 'production';
}

export class EnvConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvConfigError';
  }
}

export type EnvSource = Record<string, string | undefined>;

export function parseEnv(source: EnvSource = process.env): AppEnv {
  const parsed = rawSchema.parse({
    RESEND_API_KEY: source.RESEND_API_KEY,
    SMTP_HOST: source.SMTP_HOST,
    SMTP_PORT: source.SMTP_PORT,
    SMTP_USER: source.SMTP_USER,
    SMTP_PASS: source.SMTP_PASS,
    CONTACT_TO_EMAIL: source.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: source.CONTACT_FROM_EMAIL,
    NODE_ENV: source.NODE_ENV,
  });

  const hasResend = Boolean(parsed.RESEND_API_KEY);
  const smtpParts = [parsed.SMTP_HOST, parsed.SMTP_USER, parsed.SMTP_PASS];
  const smtpCount = smtpParts.filter(Boolean).length;
  const hasSmtp = smtpCount === 3;

  // --- coherence checks: these are always bugs, so fail loudly and early ---

  if (smtpCount > 0 && !hasSmtp) {
    const missing = (['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const).filter(
      (k) => !source[k]?.trim()
    );
    throw new EnvConfigError(
      `SMTP is partially configured. Missing: ${missing.join(', ')}. ` +
        `Set all three, or unset SMTP_HOST/SMTP_USER/SMTP_PASS entirely.`
    );
  }

  if ((hasResend || hasSmtp) && !parsed.CONTACT_FROM_EMAIL) {
    const which = hasResend ? 'RESEND_API_KEY' : 'SMTP_HOST/SMTP_USER/SMTP_PASS';
    throw new EnvConfigError(
      `${which} is set but CONTACT_FROM_EMAIL is missing. Both email providers ` +
        `require a verified sender address — without it, every quote request is ` +
        `accepted and then silently dropped. Set CONTACT_FROM_EMAIL.`
    );
  }

  const transport: EmailTransport = hasResend ? 'resend' : hasSmtp ? 'smtp' : 'none';

  return {
    resendApiKey: parsed.RESEND_API_KEY,
    smtp: hasSmtp
      ? {
          host: parsed.SMTP_HOST!,
          port: parsed.SMTP_PORT,
          user: parsed.SMTP_USER!,
          pass: parsed.SMTP_PASS!,
        }
      : undefined,
    contactToEmail: parsed.CONTACT_TO_EMAIL,
    contactFromEmail: parsed.CONTACT_FROM_EMAIL,
    transport,
    nodeEnv: parsed.NODE_ENV,
  };
}

let cached: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (!cached) cached = parseEnv();
  return cached;
}

/** Test-only: clear the memoised env so a new process.env can be parsed. */
export function resetEnvCache(): void {
  cached = undefined;
}
