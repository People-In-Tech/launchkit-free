// @ts-nocheck
import { db, purchases, type Purchase } from "@launchkit/database";
import { eq } from "drizzle-orm";

export type EntitlementPlan = "free" | "pro" | "team";

export type Entitlement = {
  plan: EntitlementPlan;
  purchase: Purchase | null;
};

/**
 * Return the buyer's LaunchKit entitlement. A row in `purchases` with
 * `status="paid"` unlocks the plan; anything else is treated as free.
 */
export async function getUserEntitlement(userId: string): Promise<Entitlement> {
  const row = await db.query.purchases.findFirst({
    where: eq(purchases.userId, userId),
  });
  if (!row || row.status !== "paid") {
    return { plan: "free", purchase: null };
  }
  return { plan: row.plan as EntitlementPlan, purchase: row };
}
