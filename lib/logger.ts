/**
 * Structured logging.
 *
 * Every line is a single JSON object so Vercel's log search can filter on
 * `event` and `level`. The repository previously had zero logging of any kind,
 * which meant a failed quote request left no trace at all.
 */

type Level = 'info' | 'warn' | 'error';

interface LogFields {
  event: string;
  [key: string]: unknown;
}

/**
 * Keys whose values must never reach a log line. Quote requests carry buyer
 * contact details; we log enough to debug and to recover a lead, but we do not
 * scatter full PII across log storage except on the explicit recovery path.
 */
const REDACT = new Set(['pass', 'password', 'apiKey', 'resendApiKey', 'authorization']);

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = REDACT.has(k) ? '[redacted]' : redact(v, depth + 1);
  }
  return out;
}

function emit(level: Level, fields: LogFields): void {
  const line = JSON.stringify({
    level,
    ts: new Date().toISOString(),
    ...(redact(fields) as Record<string, unknown>),
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (fields: LogFields) => emit('info', fields),
  warn: (fields: LogFields) => emit('warn', fields),
  error: (fields: LogFields) => emit('error', fields),
};

/**
 * Last-resort lead persistence.
 *
 * There is no database in this project, so when email delivery fails after a
 * retry we write the full submission to stderr under a distinctive marker. It is
 * recoverable from Vercel → Project → Logs by searching for LEAD_RECOVERY.
 *
 * This is a floor, not a ceiling: a real datastore (Postgres, or an Upstash
 * KV write) is strictly better and is flagged in PLAN.md as needing approval.
 */
export function persistUnsentLead(payload: Record<string, unknown>, reason: string): void {
  console.error(
    JSON.stringify({
      level: 'error',
      ts: new Date().toISOString(),
      event: 'LEAD_RECOVERY',
      marker: 'LEAD_RECOVERY',
      reason,
      lead: payload,
    })
  );
}
