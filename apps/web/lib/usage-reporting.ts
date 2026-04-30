// @ts-nocheck
/**
 * usage-reporting.ts
 *
 * Reports metered usage (AI tokens, API calls) to the active billing provider
 * so usage-based line items are billed at the end of the subscription period.
 *
 * The subscription item IDs for metered meters live in environment variables:
 *   STRIPE_AI_CREDITS_METER_ITEM_ID  — Stripe subscription item id for AI credits
 *   STRIPE_API_CALLS_METER_ITEM_ID   — Stripe subscription item id for API calls
 *
 * When Lemon Squeezy is the provider these env vars are unused; LS does not
 * currently support metered billing via API (see LemonSqueezyAdapter.reportUsage).
 */

import { db } from "@launchkit/database";
import { subscriptions } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { createBillingAdapter } from "@launchkit/billing";

/**
 * Report AI token / credit usage to the billing provider.
 *
 * @param orgId  - Organisation that consumed the tokens
 * @param tokens - Number of tokens (or credits) to report
 */
export async function reportAIUsage(orgId: string, tokens: number): Promise<void> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, orgId),
  });

  if (!sub || sub.status === "canceled" || sub.plan === "free") {
    // Free plan — usage is handled by the credit system only
    return;
  }

  const meterItemId = process.env.STRIPE_AI_CREDITS_METER_ITEM_ID;
  if (!meterItemId) {
    // Meter not configured — skip silently (credits system still deducts)
    return;
  }

  try {
    const billing = createBillingAdapter();
    await billing.reportUsage(meterItemId, tokens);
  } catch (err) {
    // Usage reporting is non-critical; log but don't throw
    console.error("[usage-reporting] Failed to report AI usage:", err);
  }
}

/**
 * Report API call usage to the billing provider.
 *
 * @param orgId - Organisation that made the API calls
 * @param calls - Number of API calls to report
 */
export async function reportAPIUsage(orgId: string, calls: number): Promise<void> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, orgId),
  });

  if (!sub || sub.status === "canceled" || sub.plan === "free") {
    return;
  }

  const meterItemId = process.env.STRIPE_API_CALLS_METER_ITEM_ID;
  if (!meterItemId) {
    return;
  }

  try {
    const billing = createBillingAdapter();
    await billing.reportUsage(meterItemId, calls);
  } catch (err) {
    console.error("[usage-reporting] Failed to report API usage:", err);
  }
}
