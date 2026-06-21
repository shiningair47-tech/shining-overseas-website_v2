import { describe, it, expect } from 'vitest';
import { checkRateLimit, resetRateLimitStore } from './rateLimit';

let testCounter = 0;
function uniqueKey(): string {
  testCounter++;
  return `test-${testCounter}`;
}

describe('checkRateLimit', () => {
  it('allows the first request', () => {
    const result = checkRateLimit(uniqueKey(), { maxRequests: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.resetIn).toBeGreaterThan(0);
  });

  it('allows requests up to the threshold and blocks the next', () => {
    const key = uniqueKey();
    const config = { maxRequests: 3, windowMs: 60_000 };

    const r1 = checkRateLimit(key, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    const r4 = checkRateLimit(key, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it('rejects all requests once threshold is exceeded', () => {
    const key = uniqueKey();
    const config = { maxRequests: 1, windowMs: 60_000 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(false);
    expect(checkRateLimit(key, config).allowed).toBe(false);
  });

  it('resets after the window expires', () => {
    const key = uniqueKey();
    const config = { maxRequests: 2, windowMs: 50 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(false);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        const result = checkRateLimit(key, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);
        resolve();
      }, 60);
    });
  });

  it('tracks independent keys separately', () => {
    const config = { maxRequests: 1, windowMs: 60_000 };
    const keyA = uniqueKey();
    const keyB = uniqueKey();

    expect(checkRateLimit(keyA, config).allowed).toBe(true);
    expect(checkRateLimit(keyA, config).allowed).toBe(false);

    expect(checkRateLimit(keyB, config).allowed).toBe(true);
    expect(checkRateLimit(keyB, config).remaining).toBe(0);
  });

  it('uses defaults when no config is passed', () => {
    const result = checkRateLimit(uniqueKey());
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('supports custom configs', () => {
    const config = { maxRequests: 10, windowMs: 5_000 };
    const key = uniqueKey();

    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(key, config);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(10 - i - 1);
    }

    expect(checkRateLimit(key, config).allowed).toBe(false);
  });

  it('returns accurate resetIn values', () => {
    const key = uniqueKey();
    const config = { maxRequests: 2, windowMs: 10_000 };

    const r1 = checkRateLimit(key, config);
    expect(r1.resetIn).toBeGreaterThan(0);
    expect(r1.resetIn).toBeLessThanOrEqual(10_000);

    const r3 = checkRateLimit(key, config); // two requests, this third is blocked
    expect(checkRateLimit(key, config).allowed).toBe(false); // actually third

    // Actually simpler: just verify resetIn is positive during the blocked state
    // Use up both slots:
    const key2 = uniqueKey();
    checkRateLimit(key2, config);
    checkRateLimit(key2, config);
    const blocked = checkRateLimit(key2, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetIn).toBeGreaterThan(0);
    expect(blocked.resetIn).toBeLessThanOrEqual(10_000);
  });

  it('handles rapid consecutive calls correctly', () => {
    const key = uniqueKey();
    const config = { maxRequests: 5, windowMs: 60_000 };

    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit(key, config);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(config.maxRequests - i - 1);
    }

    expect(checkRateLimit(key, config).allowed).toBe(false);
  });

  it('clears the store on resetRateLimitStore', () => {
    const config = { maxRequests: 2, windowMs: 60_000 };
    const key = uniqueKey();

    // Fill and exhaust one entry
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(false);

    // Reset the entire store
    resetRateLimitStore();

    // The same key should be allowed again with full remaining count
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });
});
