/**
 * Simple in-memory rate limiter for API routes.
 * In production with multiple instances, use Redis instead.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (e.g., IP address or user ID).
 * @param key - Unique identifier (IP, userId, etc.)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, limit, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining, limit, resetAt: entry.resetAt };
}

/**
 * Rate limit presets for common API patterns.
 */
export const RATE_LIMITS = {
  /** Auth endpoints: 10 requests per minute */
  auth: (key: string) => rateLimit(key, 10, 60 * 1000),
  /** AI chat: 30 requests per minute */
  aiChat: (key: string) => rateLimit(key, 30, 60 * 1000),
  /** General API: 100 requests per minute */
  api: (key: string) => rateLimit(key, 100, 60 * 1000),
  /** Webhook: 200 requests per minute */
  webhook: (key: string) => rateLimit(key, 200, 60 * 1000),
  /** File upload: 10 requests per minute */
  upload: (key: string) => rateLimit(key, 10, 60 * 1000),
} as const;
