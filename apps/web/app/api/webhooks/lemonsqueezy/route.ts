// @ts-nocheck
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createBillingAdapter } from "@launchkit/billing";
import { db } from "@launchkit/database";
import { subscriptions, organizations } from "@launchkit/database";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Shape of the Lemon Squeezy subscription object we care about
// ---------------------------------------------------------------------------
interface LSSubscriptionAttributes {
  status?: string;
  variant_id?: number;
  product_id?: number;
  customer_id?: number;
  renews_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
  first_subscription_item?: { id?: number; quantity?: number };
  urls?: { customer_portal?: string };
}

interface LSSubscriptionData {
  id?: string;
  type?: string;
  attributes?: LSSubscriptionAttributes;
}

interface LSCustomData {
  organizationId?: string;
  userId?: string;
  plan?: string;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  // Lemon Squeezy sends the HMAC digest in the X-Signature header
  const signature = headersList.get("X-Signature") ?? "";

  const billing = createBillingAdapter("lemonsqueezy");

  let event;
  try {
    event = await billing.parseWebhook(body, signature);
  } catch (err) {
    console.error("[LemonSqueezy Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // -------------------------------------------------------------------
      // checkout.completed (order_created) → upsert subscription
      // -------------------------------------------------------------------
      case "checkout.completed": {
        const customData = (event.data._customData ?? {}) as LSCustomData;
        const orgId = customData.organizationId;
        if (!orgId) break;

        // event.data is the parsed LS order/subscription payload
        const data = event.data as LSSubscriptionData & { attributes?: LSSubscriptionAttributes };
        const subId = String(data.id ?? "");
        const attrs: LSSubscriptionAttributes = data.attributes ?? {};

        await db
          .insert(subscriptions)
          .values({
            id: subId,
            organizationId: orgId,
            stripeSubscriptionId: subId,
            stripeCustomerId: String(attrs.customer_id ?? ""),
            stripePriceId: String(attrs.variant_id ?? ""),
            status: attrs.status ?? "active",
            plan: customData.plan ?? "pro",
            interval: "month",
            currentPeriodStart: attrs.created_at
              ? new Date(attrs.created_at)
              : new Date(),
            currentPeriodEnd: attrs.renews_at
              ? new Date(attrs.renews_at)
              : new Date(),
          })
          .onConflictDoUpdate({
            target: subscriptions.organizationId,
            set: {
              stripeSubscriptionId: subId,
              stripeCustomerId: String(attrs.customer_id ?? ""),
              stripePriceId: String(attrs.variant_id ?? ""),
              status: attrs.status ?? "active",
              currentPeriodStart: attrs.created_at
                ? new Date(attrs.created_at)
                : new Date(),
              currentPeriodEnd: attrs.renews_at
                ? new Date(attrs.renews_at)
                : new Date(),
            },
          });

        // Persist the LS customer ID in the orgs table
        if (attrs.customer_id) {
          await db
            .update(organizations)
            .set({ stripeCustomerId: String(attrs.customer_id) })
            .where(eq(organizations.id, orgId));
        }
        break;
      }

      // -------------------------------------------------------------------
      // invoice.paid (subscription_payment_success) → refresh period dates
      // -------------------------------------------------------------------
      case "invoice.paid": {
        const sub = event.data as LSSubscriptionData;
        if (!sub.id) break;
        const attrs: LSSubscriptionAttributes = sub.attributes ?? {};
        await db
          .update(subscriptions)
          .set({
            status: attrs.status ?? "active",
            currentPeriodStart: attrs.created_at
              ? new Date(attrs.created_at)
              : new Date(),
            currentPeriodEnd: attrs.renews_at
              ? new Date(attrs.renews_at)
              : new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      // -------------------------------------------------------------------
      // subscription.updated
      // -------------------------------------------------------------------
      case "subscription.updated": {
        const sub = event.data as LSSubscriptionData;
        if (!sub.id) break;
        const attrs: LSSubscriptionAttributes = sub.attributes ?? {};
        await db
          .update(subscriptions)
          .set({
            status: attrs.status ?? "active",
            ...(attrs.variant_id !== undefined && {
              stripePriceId: String(attrs.variant_id),
            }),
            currentPeriodStart: attrs.created_at
              ? new Date(attrs.created_at)
              : new Date(),
            currentPeriodEnd: attrs.renews_at
              ? new Date(attrs.renews_at)
              : new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      // -------------------------------------------------------------------
      // subscription.deleted (cancelled / expired)
      // -------------------------------------------------------------------
      case "subscription.deleted": {
        const sub = event.data as LSSubscriptionData;
        if (!sub.id) break;
        await db
          .update(subscriptions)
          .set({ status: "canceled", plan: "free" })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }
    }
  } catch (err) {
    console.error("[LemonSqueezy Webhook] Handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
