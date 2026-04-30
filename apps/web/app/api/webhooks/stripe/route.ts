// @ts-nocheck
export const dynamic = 'force-dynamic';
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createBillingAdapter } from "@launchkit/billing";
import { db } from "@launchkit/database";
import { subscriptions, organizations, purchases } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { sendEmail, PurchaseConfirmationEmail, AbandonedCheckoutEmail, PaymentFailedEmail } from "@launchkit/email";
// We still use the Stripe SDK for raw subscription/invoice retrieval after
// the normalised event has been parsed by the adapter.
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { inviteCollaborator } from "@/lib/github";
import { absoluteUrl } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") ?? "";

  const billing = createBillingAdapter("stripe");

  let event;
  try {
    event = await billing.parseWebhook(body, signature);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // -------------------------------------------------------------------
      // checkout.completed → two flows:
      //   1. LaunchKit's own license sale (metadata.kind === "launchkit_license")
      //      → write a row to `purchases` and (best-effort) auto-invite GitHub
      //   2. SaaS-subscription template flow (metadata.organizationId present)
      //      → upsert `subscriptions` and update the org customer id
      // -------------------------------------------------------------------
      case "checkout.completed": {
        // event.data is the raw Stripe.Checkout.Session object
        const session = event.data as Stripe.Checkout.Session;

        // Flow 1: LaunchKit license purchase
        if (session.metadata?.kind === "launchkit_license") {
          const userId = session.client_reference_id ?? session.metadata?.userId;
          const plan = session.metadata?.plan as "pro" | "team" | undefined;
          if (!userId || !plan) {
            console.warn("[Stripe Webhook] license session missing userId/plan", session.id);
            break;
          }
          await db
            .insert(purchases)
            .values({
              userId,
              plan,
              status: "paid",
              stripeCustomerId: (session.customer as string) ?? null,
              stripeCheckoutSessionId: session.id,
              amountCents: session.amount_total ?? 0,
              currency: session.currency ?? "usd",
            })
            .onConflictDoUpdate({
              target: purchases.userId,
              set: {
                plan,
                status: "paid",
                stripeCustomerId: (session.customer as string) ?? null,
                stripeCheckoutSessionId: session.id,
                amountCents: session.amount_total ?? 0,
                currency: session.currency ?? "usd",
              },
            });

          // Best-effort: send purchase confirmation email
          try {
            const clerk = await clerkClient();
            const user = await clerk.users.getUser(userId);
            const email = user.emailAddresses[0]?.emailAddress;
            if (email) {
              const amount = (session.amount_total ?? 0) / 100;
              await sendEmail({
                to: email,
                subject: "Your LaunchKit purchase is confirmed!",
                react: PurchaseConfirmationEmail({
                  firstName: user.firstName ?? "there",
                  planName: plan === "team" ? "Teams" : "Solo",
                  amountFormatted: `$${amount}`,
                  portalUrl: absoluteUrl("/portal"),
                }),
              });
            }
          } catch (err) {
            console.error("[Stripe Webhook] purchase email failed:", err);
          }

          // Best-effort: if the buyer already submitted a GitHub username
          // (edge case), auto-invite them now. Failure is non-fatal — the
          // portal form can retry.
          const existing = await db.query.purchases.findFirst({
            where: eq(purchases.userId, userId),
          });
          if (existing?.githubUsername && !existing.invitedAt) {
            try {
              await inviteCollaborator(existing.githubUsername);
              await db
                .update(purchases)
                .set({ invitedAt: new Date() })
                .where(eq(purchases.userId, userId));
            } catch (err) {
              console.error("[Stripe Webhook] auto-invite failed", err);
            }
          }
          break;
        }

        // Flow 2: SaaS-subscription template flow (per-org)
        const orgId = session.metadata?.organizationId;
        if (!orgId) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await db
          .insert(subscriptions)
          .values({
            id: subscription.id,
            organizationId: orgId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: subscription.status,
            plan: session.metadata?.plan ?? "pro",
            interval:
              subscription.items.data[0]?.price.recurring?.interval ?? "month",
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .onConflictDoUpdate({
            target: subscriptions.organizationId,
            set: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0]?.price.id,
              status: subscription.status,
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          });

        // Persist Stripe customer ID on the org record
        await db
          .update(organizations)
          .set({ stripeCustomerId: subscription.customer as string })
          .where(eq(organizations.id, orgId));

        break;
      }

      // -------------------------------------------------------------------
      // invoice.paid → refresh subscription period dates
      // -------------------------------------------------------------------
      case "invoice.paid": {
        const invoice = event.data as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await db
            .update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodStart: new Date(
                subscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            })
            .where(
              eq(subscriptions.stripeSubscriptionId, subscription.id)
            );
        }
        break;
      }

      // -------------------------------------------------------------------
      // subscription.updated → sync status + price
      // -------------------------------------------------------------------
      case "subscription.updated": {
        const subscription = event.data as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({
            status: subscription.status,
            stripePriceId: subscription.items.data[0]?.price.id,
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      // -------------------------------------------------------------------
      // subscription.deleted → mark as canceled / free
      // -------------------------------------------------------------------
      case "subscription.deleted": {
        const subscription = event.data as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ status: "canceled", plan: "free" })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      // -------------------------------------------------------------------
      // checkout.session.expired → abandoned checkout email
      // -------------------------------------------------------------------
      case "checkout.session.expired": {
        const session = event.data as Stripe.Checkout.Session;
        // Only handle LaunchKit license sessions
        if (session.metadata?.kind !== "launchkit_license") break;

        const email = session.customer_details?.email;
        if (!email) break;

        try {
          await sendEmail({
            to: email,
            subject: "You left something behind...",
            react: AbandonedCheckoutEmail({
              firstName: session.customer_details?.name?.split(" ")[0] ?? "there",
              discountCode: "LAUNCH10",
              checkoutUrl: absoluteUrl("/pricing"),
            }),
          });
        } catch (err) {
          console.error("[Stripe Webhook] abandoned checkout email failed:", err);
        }
        break;
      }

      // -------------------------------------------------------------------
      // payment_intent.payment_failed → payment failed email
      // -------------------------------------------------------------------
      case "payment_intent.payment_failed": {
        const pi = event.data as Stripe.PaymentIntent;
        if (pi.metadata?.kind !== "launchkit_license") break;

        const email = pi.receipt_email ?? pi.last_payment_error?.payment_method?.billing_details?.email;
        if (!email) break;

        try {
          await sendEmail({
            to: email,
            subject: "Your payment didn't go through",
            react: PaymentFailedEmail({
              firstName: "there",
              checkoutUrl: absoluteUrl("/pricing"),
            }),
          });
        } catch (err) {
          console.error("[Stripe Webhook] payment failed email failed:", err);
        }
        break;
      }

      // -------------------------------------------------------------------
      // charge.refunded → mark purchase as refunded
      // -------------------------------------------------------------------
      case "charge.refunded": {
        const charge = event.data as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) {
          const pi = await stripe.paymentIntents.retrieve(piId);
          const refundUserId = pi.metadata?.userId;
          if (refundUserId && pi.metadata?.kind === "launchkit_license") {
            await db
              .update(purchases)
              .set({ status: "refunded" })
              .where(eq(purchases.userId, refundUserId));
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
