// @ts-nocheck
/**
 * billing-sync.ts
 *
 * Keeps the billing provider in sync with the organisation's current seat count.
 * Call `syncSeats` whenever a member is added or removed from an organisation.
 */

import { db } from "@launchkit/database";
import { organizationMemberships, subscriptions } from "@launchkit/database";
import { eq, count } from "drizzle-orm";
import { createBillingAdapter } from "@launchkit/billing";

/**
 * Count the current members of `orgId` and update the subscription quantity
 * in the billing provider to match.
 *
 * @param orgId - The Clerk / database organisation ID
 */
export async function syncSeats(orgId: string): Promise<void> {
  // 1. Fetch the current active subscription for this org
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, orgId),
  });

  if (!sub?.stripeSubscriptionId || sub.status === "canceled" || sub.plan === "free") {
    // Nothing to sync — no paid subscription
    return;
  }

  // 2. Count current org members
  const [result] = await db
    .select({ value: count() })
    .from(organizationMemberships)
    .where(eq(organizationMemberships.organizationId, orgId));

  const seatCount = result?.value ?? 1;

  // 3. Update subscription quantity via the billing adapter
  const billing = createBillingAdapter();
  await billing.updateSubscriptionSeats(sub.stripeSubscriptionId, seatCount);

  // 4. Persist the new seat count locally so the UI can display it
  await db
    .update(subscriptions)
    .set({ seats: seatCount })
    .where(eq(subscriptions.organizationId, orgId));
}
