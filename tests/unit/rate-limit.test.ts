import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { rateLimit, clientKey, resetRateLimit } from '@/lib/rate-limit';

beforeEach(() => resetRateLimit());
afterEach(() => vi.useRealTimers());

describe('rateLimit', () => {
  it('allows requests up to the limit', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(rateLimit('a', { limit: 5 }).allowed).toBe(true);
    }
  });

  it('blocks the request after the limit is exceeded', () => {
    for (let i = 0; i < 5; i += 1) rateLimit('b', { limit: 5 });
    expect(rateLimit('b', { limit: 5 }).allowed).toBe(false);
  });

  it('counts down remaining accurately', () => {
    expect(rateLimit('c', { limit: 3 }).remaining).toBe(2);
    expect(rateLimit('c', { limit: 3 }).remaining).toBe(1);
    expect(rateLimit('c', { limit: 3 }).remaining).toBe(0);
  });

  it('keeps separate buckets per key', () => {
    for (let i = 0; i < 5; i += 1) rateLimit('client-1', { limit: 5 });
    expect(rateLimit('client-1', { limit: 5 }).allowed).toBe(false);
    expect(rateLimit('client-2', { limit: 5 }).allowed).toBe(true);
  });

  it('reports a positive retryAfter once blocked', () => {
    for (let i = 0; i < 3; i += 1) rateLimit('d', { limit: 2, windowMs: 60_000 });
    const result = rateLimit('d', { limit: 2, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });

  it('resets after the window elapses', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i += 1) rateLimit('e', { limit: 5, windowMs: 1000 });
    expect(rateLimit('e', { limit: 5, windowMs: 1000 }).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit('e', { limit: 5, windowMs: 1000 }).allowed).toBe(true);
  });
});

describe('clientKey', () => {
  it('uses the leftmost x-forwarded-for entry', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 198.51.100.1' });
    expect(clientKey(headers)).toBe('203.0.113.7');
  });

  it('trims whitespace around the address', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '  203.0.113.7  ' }))).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip', () => {
    expect(clientKey(new Headers({ 'x-real-ip': '203.0.113.9' }))).toBe('203.0.113.9');
  });

  it('falls back to a shared bucket when no client header is present', () => {
    expect(clientKey(new Headers())).toBe('unknown-client');
  });

  it('ignores an empty x-forwarded-for and falls through', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '' }))).toBe('unknown-client');
  });
});
