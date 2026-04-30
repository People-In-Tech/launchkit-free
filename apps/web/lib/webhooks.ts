// @ts-nocheck
import { db } from "@launchkit/database";
import { webhookEndpoints, webhookDeliveries } from "@launchkit/database";
import { eq, and } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "crypto";

export const WEBHOOK_EVENTS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "subscription.created",
  "subscription.updated",
  "subscription.cancelled",
  "invoice.paid",
  "invoice.failed",
  "team.member_added",
  "team.member_removed",
  "feedback.created",
  "waitlist.signup",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/**
 * Sign a payload using HMAC-SHA256.
 */
export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify a webhook signature using timing-safe comparison.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = signPayload(payload, secret);
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Send a webhook event to all matching endpoints for the given org.
 * Signs the payload with HMAC-SHA256, POSTs it, and records the delivery.
 */
export async function sendWebhook(
  orgId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
) {
  const endpoints = await db
    .select()
    .from(webhookEndpoints)
    .where(
      and(eq(webhookEndpoints.orgId, orgId), eq(webhookEndpoints.enabled, true))
    );

  const matchingEndpoints = endpoints.filter((ep) =>
    ep.events.includes(event)
  );

  const results = await Promise.allSettled(
    matchingEndpoints.map(async (endpoint) => {
      const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      });

      const signature = signPayload(body, endpoint.secret);

      // Create delivery record
      const [delivery] = await db
        .insert(webhookDeliveries)
        .values({
          endpointId: endpoint.id,
          event,
          payload,
          attempts: 1,
          maxAttempts: 5,
        })
        .returning();

      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
            "X-Webhook-Delivery": delivery.id,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });

        const responseBody = await response.text().catch(() => "");

        await db
          .update(webhookDeliveries)
          .set({
            responseStatus: response.status,
            responseBody: responseBody.slice(0, 4096),
            deliveredAt: response.ok ? new Date() : null,
            failedAt: response.ok ? null : new Date(),
            nextRetryAt: response.ok
              ? null
              : new Date(Date.now() + 60_000), // retry in 1 minute
          })
          .where(eq(webhookDeliveries.id, delivery.id));

        return { endpointId: endpoint.id, status: response.status };
      } catch (error) {
        await db
          .update(webhookDeliveries)
          .set({
            responseStatus: 0,
            responseBody:
              error instanceof Error ? error.message : "Unknown error",
            failedAt: new Date(),
            nextRetryAt: new Date(Date.now() + 60_000),
          })
          .where(eq(webhookDeliveries.id, delivery.id));

        return { endpointId: endpoint.id, status: 0, error };
      }
    })
  );

  return results;
}
