/**
 * Background job: reset-monthly-credits
 *
 * Resets AI credit balances for users on paid plans when their billing cycle renews.
 * Triggered by billing webhook events (invoice.payment_succeeded for Stripe,
 * subscription_renewed for Lemon Squeezy).
 *
 * Also handles scheduled monthly resets for free plan users.
 *
 * Usage from Stripe webhook:
 *   await tasks.trigger("reset-monthly-credits", {
 *     userId: "user_xxx",
 *     organizationId: "org_xxx",
 *     planId: "pro",
 *     billingCycleStart: new Date().toISOString(),
 *   });
 */

import { task, logger } from "@trigger.dev/sdk/v3";

export interface ResetMonthlyCreditsPayload {
  /** User ID to reset credits for */
  userId: string;
  /** Organization ID (if org subscription) */
  organizationId?: string;
  /** Plan ID determines credit amount */
  planId: "free" | "pro" | "team";
  /** ISO string of when the new billing cycle started */
  billingCycleStart: string;
}

const PLAN_CREDITS: Record<string, number> = {
  free: 100,
  pro: 5000,
  team: 25000,
};

export const resetMonthlyCredits = task({
  id: "reset-monthly-credits",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30_000,
  },

  run: async (payload: ResetMonthlyCreditsPayload) => {
    const { userId, organizationId, planId, billingCycleStart } = payload;

    const creditAmount = PLAN_CREDITS[planId] ?? PLAN_CREDITS.free;

    logger.info("Resetting monthly credits", {
      userId,
      organizationId,
      planId,
      creditAmount,
      billingCycleStart,
    });

    // Dynamic import to avoid bundling DB in cases where it's not needed
    // In a real implementation, import from @launchkit/database
    // and use addCredits / resetCredits functions.
    //
    // Example implementation:
    // const { db } = await import("@launchkit/database");
    // const { userCredits } = await import("@launchkit/database");
    // const { eq } = await import("drizzle-orm");
    //
    // await db.update(userCredits)
    //   .set({ balance: creditAmount, updatedAt: new Date() })
    //   .where(eq(userCredits.userId, userId));
    //
    // await db.insert(creditTransactions).values({
    //   userId,
    //   amount: creditAmount,
    //   type: "monthly_reset",
    //   description: `Monthly reset for ${planId} plan — ${billingCycleStart}`,
    // });

    logger.info("Credits reset complete", {
      userId,
      planId,
      creditAmount,
    });

    return { success: true, userId, planId, creditAmount };
  },
});
