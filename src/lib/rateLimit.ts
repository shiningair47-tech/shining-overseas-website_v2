interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/** Reset the rate limit store — exported for testing only. */
export function resetRateLimitStore(): void {
  store.clear();
  lastCleanup = Date.now();
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 3, windowMs: 15 * 60 * 1000 }
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // First request or window expired — reset
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + config.windowMs };
    store.set(key, newEntry);
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now };
}
