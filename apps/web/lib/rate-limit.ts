/**
 * Simple in-memory rate limiter.
 * Note: In a serverless environment (like Vercel), this state is kept per-isolate
 * and can be reset at any time. For strict distributed rate limiting, use Redis (e.g., Upstash).
 */

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitTracker>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  // Clean up old entries periodically or when accessed
  if (record && now > record.resetAt) {
    memoryStore.delete(identifier);
  }

  const currentRecord = memoryStore.get(identifier);

  if (!currentRecord) {
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (currentRecord.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: currentRecord.resetAt,
    };
  }

  currentRecord.count += 1;
  return {
    success: true,
    remaining: limit - currentRecord.count,
    reset: currentRecord.resetAt,
  };
}

export const AI_RATE_LIMITS = {
  chat: { limit: 60, windowMs: 60 * 60 * 1000 }, // 60/hr
  agent: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20/hr
  rag: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30/hr
  image: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hr
  embed: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100/hr
} as const;
