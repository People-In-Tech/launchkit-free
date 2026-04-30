// @ts-nocheck
import { db } from "@launchkit/database";
import { apiKeys } from "@launchkit/database";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `lk_live_${crypto.randomUUID().replace(/-/g, "")}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  orgId?: string;
  keyId?: string;
  scopes?: string[];
  error?: string;
}> {
  const hash = hashApiKey(key);

  const [found] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.revoked, false)));

  if (!found) {
    return { valid: false, error: "Invalid API key" };
  }

  if (found.expiresAt && new Date(found.expiresAt) < new Date()) {
    return { valid: false, error: "API key has expired" };
  }

  // Update lastUsedAt
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, found.id));

  return {
    valid: true,
    orgId: found.orgId,
    keyId: found.id,
    scopes: found.scopes ?? [],
  };
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(keyId: string, limit: number = 1000, windowSeconds: number = 3600): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(keyId);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowSeconds * 1000;
    rateLimitMap.set(keyId, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
