/**
 * Fixed-window in-memory rate limiter.
 *
 * LIMITATION, stated plainly: Vercel runs serverless functions across multiple
 * isolated instances, so this counter is per-instance, not global. An attacker
 * spraying requests across cold starts gets more than `limit` through. It raises
 * the cost of casual abuse and stops a single client hammering one instance; it
 * is not a security boundary.
 *
 * A shared store (Upstash Redis / Vercel KV) is the correct fix and is flagged
 * in PLAN.md as [needs review] because it adds a dependency and an external
 * service.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evict expired buckets so the map cannot grow without bound. */
function sweep(now: number): void {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 }: { limit?: number; windowMs?: number } = {}
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, limit, retryAfter };
  }

  return { allowed: true, remaining: limit - existing.count, limit, retryAfter };
}

/**
 * Best-effort client identity. Vercel sets x-forwarded-for; the leftmost entry
 * is the origin client. Falls back to a constant so a missing header degrades
 * to a shared bucket rather than to no limiting at all.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown-client';
}

/** Test-only: drop all buckets. */
export function resetRateLimit(): void {
  buckets.clear();
}
