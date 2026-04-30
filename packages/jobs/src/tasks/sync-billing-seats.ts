/**
 * Background job: sync-billing-seats
 *
 * Syncs the current seat count with the billing provider (Stripe or Lemon Squeezy)
 * when organization membership changes. Prevents overbilling and ensures accurate
 * per-seat charges.
 *
 * Trigger when:
 *   - A member is added to an organization
 *   - A member is removed from an organization
 *   - An organization membership role changes
 *
 * Usage:
 *   await tasks.trigger("sync-billing-seats", {
 *     organizationId: "org_xxx",
 *     currentSeatCount: 5,
 *   });
 */

import { task, logger } from "@trigger.dev/sdk/v3";

export interface SyncBillingSeatsPayload {
  /** Clerk organization ID */
  organizationId: string;
  /** Current number of active members (including owners) */
  currentSeatCount: number;
  /** Optional: reason for the sync (for logging) */
  reason?: string;
}

export const syncBillingSeats = task({
  id: "sync-billing-seats",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 60_000,
  },

  run: async (payload: SyncBillingSeatsPayload) => {
    const { organizationId, currentSeatCount, reason } = payload;

    logger.info("Syncing billing seats", { organizationId, currentSeatCount, reason });

    const billingProvider = process.env.BILLING_PROVIDER ?? "stripe";

    if (billingProvider === "stripe") {
      await syncStripeSeats(organizationId, currentSeatCount);
    } else if (billingProvider === "lemonsqueezy") {
      await syncLemonSqueezySeats(organizationId, currentSeatCount);
    } else {
      logger.warn("Unknown billing provider, skipping seat sync", { billingProvider });
    }

    logger.info("Billing seats synced", { organizationId, currentSeatCount });
    return { success: true, organizationId, currentSeatCount };
  },
});

async function syncStripeSeats(organizationId: string, seatCount: number): Promise<void> {
  // TODO: Implement Stripe subscription item quantity update
  // 1. Look up the organization's Stripe subscription ID from the database
  // 2. Find the per-seat subscription item
  // 3. Update the quantity via Stripe API
  //
  // Example:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-11-20.acacia" });
  // await stripe.subscriptionItems.update(seatSubscriptionItemId, { quantity: seatCount });

  logger.info("[stripe] Would update seat quantity", { organizationId, seatCount });
}

async function syncLemonSqueezySeats(organizationId: string, seatCount: number): Promise<void> {
  // TODO: Implement Lemon Squeezy subscription quantity update
  // 1. Look up the organization's LS subscription ID
  // 2. Update the subscription item quantity via LS API

  logger.info("[lemonsqueezy] Would update seat quantity", { organizationId, seatCount });
}
